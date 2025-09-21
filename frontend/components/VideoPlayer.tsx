'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface VideoPlayerProps {
  videoId: string
  userId: string
  email: string
}

interface PlayResponse {
  url: string
  expires: number
  watermark: string
  sessionId: string
  hbSec: number
}

interface WatermarkData {
  email: string
  sessionId: string
  timestamp: string
}

export default function VideoPlayer({ videoId, userId, email }: VideoPlayerProps) {
  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  
  // Session management
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [deviceId, setDeviceId] = useState<string>('')
  const [watermarkData, setWatermarkData] = useState<WatermarkData | null>(null)
  const [tokenExpires, setTokenExpires] = useState<number>(0)
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<any>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const renewalTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const watermarkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const watermarkCanvasRef = useRef<HTMLCanvasElement>(null)
  
  // Configuration
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'
  
  // Device ID management
  useEffect(() => {
    let storedDeviceId = localStorage.getItem('eleccourse_device_id')
    if (!storedDeviceId) {
      storedDeviceId = uuidv4()
      localStorage.setItem('eleccourse_device_id', storedDeviceId)
    }
    setDeviceId(storedDeviceId)
  }, [])

  // Watermark generation
  const generateWatermarkDataUrl = useCallback((text: string, angle: number = -20, opacity: number = 0.22) => {
    const canvas = watermarkCanvasRef.current
    if (!canvas) return ''
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    
    // Set canvas size
    canvas.width = 300
    canvas.height = 80
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Set text properties
    ctx.font = '14px Inter, sans-serif'
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.8})`
    ctx.lineWidth = 1
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Rotate canvas
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((angle * Math.PI) / 180)
    
    // Draw text with stroke (outline)
    ctx.strokeText(text, 0, 0)
    ctx.fillText(text, 0, 0)
    
    ctx.restore()
    
    return canvas.toDataURL('image/png')
  }, [])

  // Update watermark overlay
  const updateWatermark = useCallback(() => {
    if (!watermarkData) return
    
    const now = new Date().toISOString().slice(11, 19) // HH:MM:SS format
    const shortSession = watermarkData.sessionId.slice(0, 8)
    const emailPart = watermarkData.email.split('@')[0]
    const watermarkText = `${emailPart} • ${shortSession} • ${now}`
    
    // Generate tiled watermark with slight angle variation
    const angleVariation = (Math.random() - 0.5) * 10 // ±5 degrees variation
    const baseAngle = -20 + angleVariation
    const dataUrl = generateWatermarkDataUrl(watermarkText, baseAngle)
    
    // Apply to video container
    if (containerRef.current) {
      const overlay = containerRef.current.querySelector('.watermark-overlay') as HTMLDivElement
      if (overlay) {
        overlay.style.backgroundImage = `url(${dataUrl})`
        // Add slight drift animation
        const driftX = Math.sin(Date.now() / 10000) * 20
        const driftY = Math.cos(Date.now() / 15000) * 15
        overlay.style.backgroundPosition = `${driftX}px ${driftY}px`
      }
    }
  }, [watermarkData, generateWatermarkDataUrl])

  // API calls
  const fetchPlayUrl = useCallback(async (endPrevious: boolean = false): Promise<PlayResponse> => {
    const response = await fetch(`${API_BASE}/hls-play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        videoId,
        deviceId,
        sessionId,
        endPrevious
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }
    
    return response.json()
  }, [API_BASE, userId, email, videoId, deviceId, sessionId])

  const sendHeartbeat = useCallback(async () => {
    if (!sessionId) return
    
    try {
      await fetch(`${API_BASE}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
    } catch (error) {
      console.warn('Heartbeat failed:', error)
    }
  }, [API_BASE, sessionId])

  const endSession = useCallback(async () => {
    if (!sessionId) return
    
    try {
      if (navigator.sendBeacon) {
        const data = JSON.stringify({ sessionId })
        navigator.sendBeacon(`${API_BASE}/end-session`, data)
      } else {
        await fetch(`${API_BASE}/end-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        })
      }
    } catch (error) {
      console.warn('End session failed:', error)
    }
  }, [API_BASE, sessionId])

  // HLS.js integration
  const loadHlsVideo = useCallback(async (url: string) => {
    const video = videoRef.current
    if (!video) return

    // Detect if we need HLS.js or can use native HLS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    
    if (isIOS || isSafari) {
      // Use native HLS support
      video.src = url
      return
    }

    // Use HLS.js for other browsers
    try {
      // Dynamically import HLS.js
      const { default: Hls } = await import('https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.mjs')
      
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy()
        }
        
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        })
        
        hlsRef.current = hls
        
        hls.loadSource(url)
        hls.attachMedia(video)
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest loaded')
        })
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data)
          if (data.fatal) {
            setError('Video playback error occurred')
          }
        })
      } else {
        setError('HLS not supported in this browser')
      }
    } catch (error) {
      console.error('Failed to load HLS.js:', error)
      setError('Failed to initialize video player')
    }
  }, [])

  // Initialize video player
  const initializePlayer = useCallback(async (endPrevious: boolean = false) => {
    if (!deviceId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetchPlayUrl(endPrevious)
      
      // Set session data
      setSessionId(response.sessionId)
      setTokenExpires(response.expires)
      
      // Parse watermark data
      const watermarkParts = response.watermark.split(' • ')
      if (watermarkParts.length >= 4) {
        setWatermarkData({
          email: watermarkParts[0],
          sessionId: watermarkParts[2].replace('sid:', ''),
          timestamp: watermarkParts[3]
        })
      }
      
      // Load video
      await loadHlsVideo(response.url)
      
      // Setup heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      heartbeatIntervalRef.current = setInterval(sendHeartbeat, response.hbSec * 1000)
      
      // Setup token renewal (2 minutes before expiry)
      const renewalTime = (response.expires * 1000) - Date.now() - (2 * 60 * 1000)
      if (renewalTime > 0) {
        renewalTimeoutRef.current = setTimeout(() => {
          initializePlayer(false) // Renew without ending previous
        }, renewalTime)
      }
      
      setIsLoading(false)
    } catch (error: any) {
      if (error.message.includes('requireEndPrevious') || error.message.includes('409')) {
        // Handle session takeover
        const confirmTakeover = confirm(
          'Another session is active on a different device. End the other session and continue here?'
        )
        if (confirmTakeover) {
          return initializePlayer(true)
        } else {
          setError('Cannot start playback: another session is active')
        }
      } else {
        setError(error.message)
      }
      setIsLoading(false)
    }
  }, [deviceId, fetchPlayUrl, loadHlsVideo, sendHeartbeat])

  // Video event handlers
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (video) {
      setCurrentTime(video.currentTime)
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current
    if (video) {
      setDuration(video.duration)
    }
  }, [])

  const handlePlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  // Control handlers
  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    
    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }, [isPlaying])

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current
    if (video) {
      video.currentTime = time
    }
  }, [])

  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current
    if (video) {
      video.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (video) {
      if (isMuted) {
        video.volume = volume
        setIsMuted(false)
      } else {
        video.volume = 0
        setIsMuted(true)
      }
    }
  }, [isMuted, volume])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  // Mouse/touch handlers for controls
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

  // Format time display
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  // Effects
  useEffect(() => {
    if (deviceId) {
      initializePlayer()
    }
  }, [deviceId, initializePlayer])

  useEffect(() => {
    // Update watermark every 10 seconds
    if (watermarkData) {
      updateWatermark()
      watermarkIntervalRef.current = setInterval(updateWatermark, 10000)
    }
    
    return () => {
      if (watermarkIntervalRef.current) {
        clearInterval(watermarkIntervalRef.current)
      }
    }
  }, [watermarkData, updateWatermark])

  useEffect(() => {
    // Fullscreen change handler
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      if (renewalTimeoutRef.current) {
        clearTimeout(renewalTimeoutRef.current)
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      if (watermarkIntervalRef.current) {
        clearInterval(watermarkIntervalRef.current)
      }
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
      endSession()
    }
  }, [endSession])

  // Beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession()
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [endSession])

  if (isLoading) {
    return (
      <div className="relative bg-black aspect-video flex items-center justify-center">
        <div className="text-center text-white">
          <div className="loading mb-4"></div>
          <p>Loading secure video player...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative bg-black aspect-video flex items-center justify-center">
        <div className="text-center text-white p-6">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Playback Error</h3>
          <p className="text-neutral-300 mb-4">{error}</p>
          <button 
            onClick={() => initializePlayer()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hidden canvas for watermark generation */}
      <canvas ref={watermarkCanvasRef} style={{ display: 'none' }} />
      
      {/* Video Container */}
      <div 
        ref={containerRef}
        className={`relative bg-black group cursor-pointer ${isFullscreen ? 'h-screen w-screen' : 'aspect-video'}`}
        onMouseMove={showControlsTemporarily}
        onTouchStart={showControlsTemporarily}
        onClick={togglePlay}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          playsInline
          preload="metadata"
        />

        {/* Watermark Overlay */}
        {watermarkData && (
          <div 
            className="watermark-overlay absolute inset-0 pointer-events-none"
            style={{
              backgroundRepeat: 'repeat',
              backgroundSize: '300px 80px',
              opacity: 0.22,
              zIndex: 10
            }}
          />
        )}

        {/* Corner Watermark */}
        {watermarkData && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded pointer-events-none" style={{ zIndex: 11 }}>
            {watermarkData.email.split('@')[0]} • {new Date().toLocaleTimeString()}
          </div>
        )}

        {/* Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: 20 }}
        >
          {/* Play/Pause Button (Center) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
              className={`w-20 h-20 rounded-full bg-black/50 flex items-center justify-center text-white transition-all hover:bg-black/70 ${
                isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
              }`}
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <div 
                className="w-full h-1 bg-white/30 rounded-full cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  const rect = e.currentTarget.getBoundingClientRect()
                  const percent = (e.clientX - rect.left) / rect.width
                  handleSeek(percent * duration)
                }}
              >
                <div 
                  className="h-full bg-white rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePlay()
                  }}
                  className="hover:text-blue-400 transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMute()
                    }}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {isMuted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleVolumeChange(parseFloat(e.target.value))
                    }}
                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, white 0%, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                    }}
                  />
                </div>

                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFullscreen()
                  }}
                  className="hover:text-blue-400 transition-colors"
                >
                  {isFullscreen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9V4.5M15 9h4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15v4.5m0-4.5h4.5m-4.5 0l5.5 5.5" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}