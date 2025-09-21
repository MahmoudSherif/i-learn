// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const app = express();
app.use(cors());                 // allow your frontend to call this API
app.use(express.json());         // parse JSON bodies
app.set("trust proxy", true);    // makes req.ip accurate behind proxies/CDNs

// ===== ENV =====
const {
  PORT = 3000,
  PULL_ZONE_BASE,                // e.g. https://vz-XXXX.b-cdn.net  (no trailing slash)
  BUNNY_CDN_TOKEN_KEY,           // Stream > Library > Settings > Security (Advanced CDN token key)

  // Security knobs
  TOKEN_TTL_SECONDS = "900",     // default 15 minutes
  BIND_IP = "false",             // "true" in prod to bind token to client IP
  ALLOWED_COUNTRIES = "",        // e.g. "EG,SA"
  SPEED_LIMIT_KBPS = "",         // e.g. "1500" (kB/s)

  // Anti-sharing policy
  MAX_CONCURRENT = "1",          // 1 active session per user
  MAX_DEVICES = "2",             // max registered devices per user
  HEARTBEAT_SECONDS = "60",      // client heartbeat interval
  GRACE_SECONDS = "120",         // session stays active this long after last heartbeat

  // Sequential-sharing deterrents
  COOLDOWN_SECONDS = "300",      // require 5 min between handoffs across different device/IP
  SESSION_STARTS_PER_DAY = "20", // daily start budget
  REQUIRE_HARD_TAKEOVER = "true" // 409 unless endPrevious=true
} = process.env;

if (!PULL_ZONE_BASE || !BUNNY_CDN_TOKEN_KEY) {
  console.error("❌ Missing PULL_ZONE_BASE or BUNNY_CDN_TOKEN_KEY in .env");
  process.exit(1);
}

const bool   = v => String(v).toLowerCase() === "true";
const nowS   = () => Math.floor(Date.now() / 1000);
const uuid   = () => crypto.randomUUID();
const b64url = buf => Buffer.from(buf).toString("base64")
  .replace(/\+/g,"-").replace(/\//g,"_").replace(/=+/g,"");

// ===== In-memory stores (use Redis/DB in production) =====
const DEVICES       = new Map(); // userId -> Set(deviceId)
const SESSIONS      = new Map(); // sessionId -> { userId, deviceId, ip, ua, videoId, expTs, lastBeatTs, active }
const USER_SESSIONS = new Map(); // userId -> Set(sessionId)
const USER_STARTS   = new Map(); // userId -> { day: 'YYYY-MM-DD', count: n }

// ===== Helpers =====
function signPathToken({ baseUrl, tokenKey, tokenPath, resourcePath, ttlSeconds, remoteIp, extras = {} }) {
  // IMPORTANT: correct URL-encoding for token_path (values encoded in URL, raw in hash)
  const exp = nowS() + Number(ttlSeconds);

  // Build params for hash (RAW) and for URL (encode values!)
  const params = { token_path: tokenPath, ...extras };

  // Sorted keys (alphabetical) — Bunny requires this order in the hash
  const keys = Object.keys(params).sort();

  // For hashing: DO NOT URL-encode
  const sortedQueryForHash = keys.map(k => `${k}=${params[k]}`).join("&");

  // For the actual URL: encode VALUES
  const sortedQueryForUrl  = keys.map(k => `${k}=${encodeURIComponent(params[k])}`).join("&");

  // Hash base (raw):
  // token = b64url( SHA256( key + token_path + expires + [remote_ip] + [sorted_query_params] ) )
  const hashBase = `${tokenKey}${tokenPath}${exp}${remoteIp ? remoteIp : ""}${sortedQueryForHash}`;
  const token = b64url(crypto.createHash("sha256").update(hashBase).digest());

  // Path token URL form:
  // https://host/bcdn_token=<token>&expires=<exp>&<sortedQueryForUrl>/<videoId>/playlist.m3u8
  const prefix = `${baseUrl}/bcdn_token=${token}&expires=${exp}${sortedQueryForUrl ? `&${sortedQueryForUrl}` : ""}`;
  return { url: `${prefix}${resourcePath}`, expires: exp };
}

function cleanupExpired() {
  const tNow = nowS();
  for (const [sid, s] of SESSIONS) {
    const alive = s.lastBeatTs && (tNow - s.lastBeatTs <= Number(GRACE_SECONDS));
    const notExpired = tNow <= s.expTs + Number(GRACE_SECONDS);
    if (!(s.active && alive && notExpired)) {
      SESSIONS.delete(sid);
      const set = USER_SESSIONS.get(s.userId);
      if (set) { set.delete(sid); if (!set.size) USER_SESSIONS.delete(s.userId); }
    }
  }
}
setInterval(cleanupExpired, 15000);

function userActiveCount(userId) {
  cleanupExpired();
  const set = USER_SESSIONS.get(userId);
  if (!set) return 0;
  let c = 0;
  const tNow = nowS();
  for (const sid of set) {
    const s = SESSIONS.get(sid);
    if (!s) continue;
    const alive = s.lastBeatTs && (tNow - s.lastBeatTs <= Number(GRACE_SECONDS));
    const notExpired = tNow <= s.expTs + Number(GRACE_SECONDS);
    if (s.active && alive && notExpired) c++;
  }
  return c;
}

function ensureDevice(userId, deviceId) {
  const dset = DEVICES.get(userId) || new Set();
  if (!dset.has(deviceId)) {
    if (dset.size >= Number(MAX_DEVICES)) return false;
    dset.add(deviceId);
    DEVICES.set(userId, dset);
  }
  return true;
}

function todayStr() { return new Date().toISOString().slice(0,10); }
function incStarts(userId) {
  const t = todayStr();
  const cur = USER_STARTS.get(userId) || { day: t, count: 0 };
  if (cur.day !== t) { cur.day = t; cur.count = 0; }
  cur.count++; USER_STARTS.set(userId, cur);
  return cur.count;
}
function startsLeft(userId) {
  const t = todayStr();
  const cur = USER_STARTS.get(userId);
  return Number(SESSION_STARTS_PER_DAY) - (cur && cur.day === t ? cur.count : 0);
}

// TODO: replace with your real DB/entitlement check
function isEnrolled(userId, videoId) { return Boolean(userId && videoId); }

// ===== Routes =====

// Issue or renew a playback session and a signed HLS URL
app.post("/hls-play", (req, res) => {
  try {
    const { userId, email, videoId, deviceId, sessionId } = req.body || {};
    const endPrevious = !!req.body?.endPrevious;
    const ttl = Number(req.body?.ttlSeconds || TOKEN_TTL_SECONDS);

    if (!userId || !email || !videoId || !deviceId) {
      return res.status(400).json({ error: "Missing fields: userId, email, videoId, deviceId" });
    }
    if (!isEnrolled(userId, videoId)) {
      return res.status(403).json({ error: "Not enrolled for this video" });
    }
    if (!ensureDevice(userId, deviceId)) {
      return res.status(429).json({ error: "Device limit reached" });
    }

    cleanupExpired();
    const userSet = USER_SESSIONS.get(userId);
    let otherActive = null;
    if (userSet) {
      for (const sid of userSet) {
        const s = SESSIONS.get(sid);
        if (!s) continue;
        const alive = s.lastBeatTs && (nowS() - s.lastBeatTs <= Number(GRACE_SECONDS));
        const notExpired = nowS() <= s.expTs + Number(GRACE_SECONDS);
        if (s.active && alive && notExpired) { otherActive = { sid, s }; break; }
      }
    }

    // Concurrency / takeover
    const requireTakeover = bool(REQUIRE_HARD_TAKEOVER);
    if (otherActive && sessionId !== otherActive.sid) {
      if (requireTakeover && !endPrevious) {
        return res.status(409).json({
          error: "Another session is active",
          requireEndPrevious: true,
          sessionId: otherActive.sid
        });
      }
      // Hard handoff: end old session
      SESSIONS.delete(otherActive.sid);
      const set = USER_SESSIONS.get(userId);
      if (set) { set.delete(otherActive.sid); if (!set.size) USER_SESSIONS.delete(userId); }
    }

    // Cooldown when switching device/IP quickly
    if (!sessionId && otherActive) {
      const s = otherActive.s;
      const ipChanged  = s.ip !== req.ip;
      const devChanged = s.deviceId !== deviceId;
      if ((ipChanged || devChanged) && (nowS() - (s.lastBeatTs || 0) < Number(COOLDOWN_SECONDS))) {
        return res.status(429).json({ error: "Cooldown in effect. Try again in a few minutes." });
      }
    }

    // Daily start budget
    if (!sessionId) {
      if (startsLeft(userId) <= 0) {
        return res.status(429).json({ error: "Daily session start limit reached" });
      }
      incStarts(userId);
    }

    const ip = req.ip;
    const ua = req.get("user-agent") || "";
    const bindIp = bool(BIND_IP) ? ip : null;

    const tokenPath   = `/${videoId}/`;             // authorize whole folder
    const resourcePath= `/${videoId}/playlist.m3u8`;
    const extras = {};
    if (ALLOWED_COUNTRIES) extras.token_countries = ALLOWED_COUNTRIES;
    if (SPEED_LIMIT_KBPS)  extras.limit = String(SPEED_LIMIT_KBPS);

    const { url, expires } = signPathToken({
      baseUrl: PULL_ZONE_BASE,
      tokenKey: BUNNY_CDN_TOKEN_KEY,
      tokenPath,
      resourcePath,
      ttlSeconds: ttl,
      remoteIp: bindIp,
      extras
    });

    const sid = sessionId || uuid();
    const session = {
      userId, deviceId, ip, ua, videoId,
      expTs: expires, lastBeatTs: nowS(), active: true
    };
    SESSIONS.set(sid, session);
    const set = USER_SESSIONS.get(userId) || new Set();
    set.add(sid); USER_SESSIONS.set(userId, set);

    const wm = `${email} • dev:${deviceId.slice(0,8)} • sid:${sid.slice(0,8)} • ${new Date().toISOString()}`;
    console.log(`[HLS path-token] user=${userId} video=${videoId} -> ${url.slice(0, 140)}...`);
    return res.json({ url, expires, watermark: wm, sessionId: sid, hbSec: Number(HEARTBEAT_SECONDS) });
  } catch (err) {
    console.error("Signing error:", err);
    return res.status(500).json({ error: "Failed to sign URL" });
  }
});

// Heartbeat to keep the session alive
app.post("/heartbeat", (req, res) => {
  const { sessionId } = req.body || {};
  const s = sessionId && SESSIONS.get(sessionId);
  if (!s) return res.status(404).json({ error: "session not found" });
  s.lastBeatTs = nowS();
  return res.json({ ok: true, expTs: s.expTs });
});

// End session early (logout/close)
app.post("/end-session", (req, res) => {
  const { sessionId } = req.body || {};
  const s = sessionId && SESSIONS.get(sessionId);
  if (s) {
    SESSIONS.delete(sessionId);
    const set = USER_SESSIONS.get(s.userId);
    if (set) { set.delete(sessionId); if (!set.size) USER_SESSIONS.delete(s.userId); }
  }
  return res.json({ ok: true });
});

// Simple health
app.get("/", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});

