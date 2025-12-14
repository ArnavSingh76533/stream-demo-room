"use client"
import React, { FC, useEffect, useRef, useState, useCallback } from "react"
import Hls from "hls.js"

interface Html5VideoPlayerProps {
  url: string
  playing: boolean
  volume: number
  muted: boolean
  playbackRate: number
  loop: boolean
  onReady: () => void
  onPlay: () => void
  onPause: () => void
  onEnded: () => void
  onError: (error: any) => void
  onProgress: (state: { playedSeconds: number }) => void
  onDuration: (duration: number) => void
  onBuffer: () => void
  onBufferEnd: () => void
  seekTo?: number
  pip?: boolean
  style?: React.CSSProperties
  className?: string
}

const Html5VideoPlayer: FC<Html5VideoPlayerProps> = ({
  url,
  playing,
  volume,
  muted,
  playbackRate,
  loop,
  onReady,
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
  onDuration,
  onBuffer,
  onBufferEnd,
  seekTo,
  pip = false,
  style,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [currentUrl, setCurrentUrl] = useState(url)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const seekingRef = useRef(false)
  const lastSeekToRef = useRef<number | undefined>(undefined)
  const hlsRef = useRef<Hls | null>(null)

  // Handle PiP state
  useEffect(() => {
    const video = videoRef.current
    if (!video || !document.pictureInPictureEnabled) return

    const handlePiP = async () => {
      try {
        if (pip && document.pictureInPictureElement !== video) {
          await video.requestPictureInPicture()
        } else if (!pip && document.pictureInPictureElement === video) {
          await document.exitPictureInPicture()
        }
      } catch (error) {
        console.error("PiP error:", error)
      }
    }

    handlePiP()
  }, [pip])

  // Handle URL changes
  useEffect(() => {
    if (url !== currentUrl) {
      setIsReady(false)
      setCurrentUrl(url)
      
      // Clean up HLS instance if it exists
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }

      const video = videoRef.current
      if (!video) return

      // Check if URL is HLS (.m3u8)
      if (url.includes('.m3u8')) {
        // Try native HLS support first (Safari)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url
        } else if (Hls.isSupported()) {
          // Use hls.js for browsers that don't support native HLS
          const hls = new Hls()
          hls.loadSource(url)
          hls.attachMedia(video)
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("HLS manifest parsed")
          })
          hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
            console.error("HLS error:", data)
            if (data.fatal) {
              onError(new Error(`HLS Error: ${data.type}`))
            }
          })
          hlsRef.current = hls
        } else {
          // Fallback to direct source
          video.src = url
        }
      } else {
        video.src = url
      }
    }
  }, [url, currentUrl, onError])

  // Handle play/pause
  useEffect(() => {
    const video = videoRef.current
    if (!video || !isReady) return

    if (playing) {
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Play interrupted:", error)
        })
      }
    } else {
      video.pause()
    }
  }, [playing, isReady])

  // Handle volume
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.volume = volume
  }, [volume])

  // Handle muted
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = muted
  }, [muted])

  // Handle playback rate
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = playbackRate
  }, [playbackRate])

  // Handle loop
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.loop = loop
  }, [loop])

  // Handle seeking
  useEffect(() => {
    if (seekTo !== undefined && seekTo !== lastSeekToRef.current) {
      const video = videoRef.current
      if (video && !seekingRef.current) {
        lastSeekToRef.current = seekTo
        video.currentTime = seekTo
      }
    }
  }, [seekTo])

  // Progress reporting
  useEffect(() => {
    const video = videoRef.current
    if (!video || !isReady) return

    const reportProgress = () => {
      if (!seekingRef.current) {
        onProgress({ playedSeconds: video.currentTime })
      }
    }

    // Report progress every 250ms when playing
    if (playing) {
      progressIntervalRef.current = setInterval(reportProgress, 250)
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [isReady, playing, onProgress])

  // Video element event handlers
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current
    if (video) {
      onDuration(video.duration)
    }
  }, [onDuration])

  const handleCanPlay = useCallback(() => {
    if (!isReady) {
      setIsReady(true)
      onReady()
    }
    onBufferEnd()
  }, [isReady, onReady, onBufferEnd])

  const handlePlay = useCallback(() => {
    onPlay()
  }, [onPlay])

  const handlePause = useCallback(() => {
    onPause()
  }, [onPause])

  const handleEnded = useCallback(() => {
    onEnded()
  }, [onEnded])

  const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget
    const error = video.error
    console.error("Video error:", error)
    onError(error || new Error("Unknown video error"))
  }, [onError])

  const handleWaiting = useCallback(() => {
    onBuffer()
  }, [onBuffer])

  const handleSeeking = useCallback(() => {
    seekingRef.current = true
  }, [])

  const handleSeeked = useCallback(() => {
    seekingRef.current = false
    const video = videoRef.current
    if (video) {
      onProgress({ playedSeconds: video.currentTime })
    }
  }, [onProgress])

  const handleStalled = useCallback(() => {
    console.warn("Video stalled")
    onBuffer()
  }, [onBuffer])

  // Cleanup
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [])

  return (
    <video
      ref={videoRef}
      style={style}
      className={className}
      playsInline
      crossOrigin="anonymous"
      onLoadedMetadata={handleLoadedMetadata}
      onCanPlay={handleCanPlay}
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={handleEnded}
      onError={handleError}
      onWaiting={handleWaiting}
      onSeeking={handleSeeking}
      onSeeked={handleSeeked}
      onStalled={handleStalled}
    />
  )
}

export default Html5VideoPlayer
