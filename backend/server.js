const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for accurate IP detection
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());

// In-memory stores (use Redis/DB in production)
const DEVICES = new Map(); // userId -> Set(deviceId)
const SESSIONS = new Map(); // sessionId -> { userId, email, videoId, deviceId, ip, createdAt, lastBeatTs, expires }
const USER_SESSIONS = new Map(); // userId -> Set(sessionId)
const USER_STARTS = new Map(); // userId -> { date: YYYY-MM-DD, count }
const COOLDOWN_TRACKER = new Map(); // userId -> { lastDeviceId, lastIP, lastSwitchTs }

// Configuration
const CONFIG = {
  PULL_ZONE_BASE: process.env.PULL_ZONE_BASE,
  BUNNY_CDN_TOKEN_KEY: process.env.BUNNY_CDN_TOKEN_KEY,
  TOKEN_TTL_SECONDS: parseInt(process.env.TOKEN_TTL_SECONDS) || 900,
  BIND_IP: process.env.BIND_IP === 'true',
  ALLOWED_COUNTRIES: process.env.ALLOWED_COUNTRIES ? process.env.ALLOWED_COUNTRIES.split(',') : [],
  SPEED_LIMIT_KBPS: process.env.SPEED_LIMIT_KBPS ? parseInt(process.env.SPEED_LIMIT_KBPS) : null,
  MAX_CONCURRENT: parseInt(process.env.MAX_CONCURRENT) || 1,
  MAX_DEVICES: parseInt(process.env.MAX_DEVICES) || 2,
  HEARTBEAT_SECONDS: parseInt(process.env.HEARTBEAT_SECONDS) || 60,
  GRACE_SECONDS: parseInt(process.env.GRACE_SECONDS) || 120,
  COOLDOWN_SECONDS: parseInt(process.env.COOLDOWN_SECONDS) || 300,
  SESSION_STARTS_PER_DAY: parseInt(process.env.SESSION_STARTS_PER_DAY) || 20,
  REQUIRE_HARD_TAKEOVER: process.env.REQUIRE_HARD_TAKEOVER === 'true'
};

// Utility functions
function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateBunnyToken(tokenPath, expires, remoteIp = null, queryParams = {}) {
  if (!CONFIG.BUNNY_CDN_TOKEN_KEY) {
    throw new Error('BUNNY_CDN_TOKEN_KEY not configured');
  }

  // Sort query parameters alphabetically
  const sortedParams = Object.keys(queryParams)
    .sort()
    .map(key => `${key}=${queryParams[key]}`)
    .join('&');

  // Build hash input: key + token_path + expires + [remote_ip] + [sorted_query_params]
  let hashInput = CONFIG.BUNNY_CDN_TOKEN_KEY + tokenPath + expires;
  
  if (remoteIp && CONFIG.BIND_IP) {
    hashInput += remoteIp;
  }
  
  if (sortedParams) {
    hashInput += sortedParams;
  }

  // Generate SHA256 hash and encode as Base64URL
  const hash = crypto.createHash('sha256').update(hashInput).digest();
  const token = base64UrlEncode(hash);

  return token;
}

function createSignedUrl(videoId, remoteIp = null, ttlSeconds = CONFIG.TOKEN_TTL_SECONDS) {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const tokenPath = `/${videoId}/`;
  
  // Build query parameters
  const queryParams = {};
  
  if (CONFIG.ALLOWED_COUNTRIES.length > 0) {
    queryParams.token_countries = CONFIG.ALLOWED_COUNTRIES.join(',');
  }
  
  if (CONFIG.SPEED_LIMIT_KBPS) {
    queryParams.limit = CONFIG.SPEED_LIMIT_KBPS;
  }

  // Generate token
  const token = generateBunnyToken(tokenPath, expires, remoteIp, queryParams);

  // Build final URL
  const sortedQuery = Object.keys(queryParams)
    .sort()
    .map(key => `${key}=${queryParams[key]}`)
    .join('&');

  let url = `${CONFIG.PULL_ZONE_BASE}/bcdn_token=${token}&expires=${expires}`;
  if (sortedQuery) {
    url += `&${sortedQuery}`;
  }
  url += `/${videoId}/playlist.m3u8`;

  return { url, expires };
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function checkDailyStartsLimit(userId) {
  const today = getTodayKey();
  const userStarts = USER_STARTS.get(userId) || { date: today, count: 0 };
  
  // Reset counter if it's a new day
  if (userStarts.date !== today) {
    userStarts.date = today;
    userStarts.count = 0;
  }
  
  if (userStarts.count >= CONFIG.SESSION_STARTS_PER_DAY) {
    return false;
  }
  
  userStarts.count++;
  USER_STARTS.set(userId, userStarts);
  return true;
}

function checkCooldown(userId, deviceId, clientIp) {
  const cooldownData = COOLDOWN_TRACKER.get(userId);
  if (!cooldownData) {
    COOLDOWN_TRACKER.set(userId, { lastDeviceId: deviceId, lastIP: clientIp, lastSwitchTs: Date.now() });
    return true;
  }

  const now = Date.now();
  const timeSinceLastSwitch = now - cooldownData.lastSwitchTs;
  
  // Check if device or IP changed within cooldown period
  if ((cooldownData.lastDeviceId !== deviceId || cooldownData.lastIP !== clientIp) && 
      timeSinceLastSwitch < CONFIG.COOLDOWN_SECONDS * 1000) {
    return false;
  }

  // Update tracking data
  cooldownData.lastDeviceId = deviceId;
  cooldownData.lastIP = clientIp;
  cooldownData.lastSwitchTs = now;
  
  return true;
}

function registerDevice(userId, deviceId) {
  if (!DEVICES.has(userId)) {
    DEVICES.set(userId, new Set());
  }
  
  const userDevices = DEVICES.get(userId);
  
  if (!userDevices.has(deviceId) && userDevices.size >= CONFIG.MAX_DEVICES) {
    return false;
  }
  
  userDevices.add(deviceId);
  return true;
}

function getActiveUserSessions(userId) {
  const userSessions = USER_SESSIONS.get(userId) || new Set();
  const activeSessions = [];
  
  for (const sessionId of userSessions) {
    const session = SESSIONS.get(sessionId);
    if (session && isSessionActive(session)) {
      activeSessions.push(session);
    }
  }
  
  return activeSessions;
}

function isSessionActive(session) {
  const now = Date.now();
  const gracePeriod = CONFIG.GRACE_SECONDS * 1000;
  return (now - session.lastBeatTs) <= gracePeriod;
}

function endSession(sessionId) {
  const session = SESSIONS.get(sessionId);
  if (!session) return;
  
  // Remove from user sessions
  const userSessions = USER_SESSIONS.get(session.userId);
  if (userSessions) {
    userSessions.delete(sessionId);
    if (userSessions.size === 0) {
      USER_SESSIONS.delete(session.userId);
    }
  }
  
  // Remove session
  SESSIONS.delete(sessionId);
}

function createWatermark(email, deviceId, sessionId) {
  const timestamp = new Date().toISOString();
  return `${email} • dev:${deviceId.slice(0, 8)} • sid:${sessionId.slice(0, 8)} • ${timestamp}`;
}

// Cleanup expired sessions every minute
setInterval(() => {
  const now = Date.now();
  const gracePeriod = CONFIG.GRACE_SECONDS * 1000;
  
  for (const [sessionId, session] of SESSIONS.entries()) {
    if ((now - session.lastBeatTs) > gracePeriod) {
      console.log(`Cleaning up expired session: ${sessionId}`);
      endSession(sessionId);
    }
  }
}, 60000);

// API Endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeSessions: SESSIONS.size,
    registeredDevices: Array.from(DEVICES.values()).reduce((sum, devices) => sum + devices.size, 0)
  });
});

// Get HLS play URL
app.post('/hls-play', (req, res) => {
  try {
    const { userId, email, videoId, deviceId, sessionId, ttlSeconds, endPrevious } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Validate required fields
    if (!userId || !email || !videoId || !deviceId) {
      return res.status(400).json({ error: 'Missing required fields: userId, email, videoId, deviceId' });
    }

    // Check device registration
    if (!registerDevice(userId, deviceId)) {
      return res.status(429).json({ error: 'Device limit reached' });
    }

    // Check cooldown
    if (!checkCooldown(userId, deviceId, clientIp)) {
      return res.status(429).json({ error: 'Cooldown period active. Please wait before switching devices/IPs.' });
    }

    // Check daily starts limit (only for new sessions)
    if (!sessionId && !checkDailyStartsLimit(userId)) {
      return res.status(429).json({ error: 'Daily session start limit exceeded' });
    }

    // Handle existing session renewal
    if (sessionId) {
      const existingSession = SESSIONS.get(sessionId);
      if (existingSession && existingSession.userId === userId) {
        // Renew existing session
        const { url, expires } = createSignedUrl(videoId, CONFIG.BIND_IP ? clientIp : null, ttlSeconds);
        
        existingSession.lastBeatTs = Date.now();
        existingSession.expires = expires;
        
        const watermark = createWatermark(email, deviceId, sessionId);
        
        return res.json({
          url,
          expires,
          watermark,
          sessionId,
          hbSec: CONFIG.HEARTBEAT_SECONDS
        });
      }
    }

    // Check for active sessions
    const activeSessions = getActiveUserSessions(userId);
    const activeSessionsFromOtherDevices = activeSessions.filter(s => s.deviceId !== deviceId);

    if (activeSessionsFromOtherDevices.length >= CONFIG.MAX_CONCURRENT) {
      if (CONFIG.REQUIRE_HARD_TAKEOVER && !endPrevious) {
        return res.status(409).json({ 
          requireEndPrevious: true,
          message: 'Another session is active. End it to continue?',
          activeSessions: activeSessionsFromOtherDevices.map(s => ({
            deviceId: s.deviceId.slice(0, 8),
            createdAt: s.createdAt
          }))
        });
      }

      if (endPrevious) {
        // End all active sessions from other devices
        activeSessionsFromOtherDevices.forEach(session => {
          endSession(session.sessionId);
        });
      }
    }

    // Create new session
    const newSessionId = sessionId || uuidv4();
    const { url, expires } = createSignedUrl(videoId, CONFIG.BIND_IP ? clientIp : null, ttlSeconds);
    
    const session = {
      sessionId: newSessionId,
      userId,
      email,
      videoId,
      deviceId,
      ip: clientIp,
      createdAt: Date.now(),
      lastBeatTs: Date.now(),
      expires
    };

    SESSIONS.set(newSessionId, session);

    // Track user sessions
    if (!USER_SESSIONS.has(userId)) {
      USER_SESSIONS.set(userId, new Set());
    }
    USER_SESSIONS.get(userId).add(newSessionId);

    const watermark = createWatermark(email, deviceId, newSessionId);

    res.json({
      url,
      expires,
      watermark,
      sessionId: newSessionId,
      hbSec: CONFIG.HEARTBEAT_SECONDS
    });

  } catch (error) {
    console.error('Error in /hls-play:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Heartbeat endpoint
app.post('/heartbeat', (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    const session = SESSIONS.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update heartbeat timestamp
    session.lastBeatTs = Date.now();

    res.json({ 
      ok: true, 
      expTs: session.expires 
    });

  } catch (error) {
    console.error('Error in /heartbeat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End session endpoint
app.post('/end-session', (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    endSession(sessionId);

    res.json({ ok: true });

  } catch (error) {
    console.error('Error in /end-session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoints (remove in production)
if (process.env.NODE_ENV === 'development') {
  app.get('/debug/sessions', (req, res) => {
    const sessions = Array.from(SESSIONS.entries()).map(([id, session]) => ({
      sessionId: id,
      userId: session.userId,
      deviceId: session.deviceId.slice(0, 8),
      active: isSessionActive(session),
      createdAt: new Date(session.createdAt).toISOString(),
      lastBeat: new Date(session.lastBeatTs).toISOString()
    }));
    
    res.json({ sessions, total: sessions.length });
  });

  app.get('/debug/devices', (req, res) => {
    const devices = {};
    for (const [userId, deviceSet] of DEVICES.entries()) {
      devices[userId] = Array.from(deviceSet);
    }
    res.json(devices);
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ElecCourse Backend running on port ${PORT}`);
  console.log(`📺 Bunny Stream integration: ${CONFIG.PULL_ZONE_BASE ? '✅' : '❌'}`);
  console.log(`🔒 Security features: ${CONFIG.MAX_DEVICES} devices, ${CONFIG.MAX_CONCURRENT} concurrent, ${CONFIG.COOLDOWN_SECONDS}s cooldown`);
  
  if (!CONFIG.BUNNY_CDN_TOKEN_KEY) {
    console.warn('⚠️  BUNNY_CDN_TOKEN_KEY not set - video streaming will not work');
  }
  
  if (!CONFIG.PULL_ZONE_BASE) {
    console.warn('⚠️  PULL_ZONE_BASE not set - video streaming will not work');
  }
});

module.exports = app;