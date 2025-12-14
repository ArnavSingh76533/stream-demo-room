"use client"
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react"
import Html5VideoPlayer from "./Html5VideoPlayer"

export interface Html5PlayerWrapperHandle {
  seekTo: (seconds: number, type?: string) => void
  getCurrentTime: () => number
  getInternalPlayer: () => HTMLVideoElement | null
}

interface Html5PlayerWrapperProps {
  url: string
  playing?: boolean
  volume?: number
  muted?: boolean
  playbackRate?: number
  loop?: boolean
  pip?: boolean
  controls?: boolean
  width?: string | number
  height?: string | number
  style?: React.CSSProperties
  config?: any
  onReady?: () => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (error: any) => void
  onProgress?: (state: { playedSeconds: number }) => void
  onDuration?: (duration: number) => void
  onBuffer?: () => void
  onBufferEnd?: () => void
}

const Html5PlayerWrapper = forwardRef<Html5PlayerWrapperHandle, Html5PlayerWrapperProps>(
  (props, ref) => {
    const {
      url,
      playing = false,
      volume = 1,
      muted = false,
      playbackRate = 1,
      loop = false,
      pip = false,
      width = "100%",
      height = "100%",
      style = {},
      onReady = () => {},
      onPlay = () => {},
      onPause = () => {},
      onEnded = () => {},
      onError = () => {},
      onProgress = () => {},
      onDuration = () => {},
      onBuffer = () => {},
      onBufferEnd = () => {},
    } = props

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [seekToValue, setSeekToValue] = useState<number | undefined>(undefined)

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        setSeekToValue(seconds)
        // Reset after a frame to allow re-seeking to the same position
        setTimeout(() => setSeekToValue(undefined), 0)
      },
      getCurrentTime: () => {
        return videoRef.current?.currentTime || 0
      },
      getInternalPlayer: () => {
        return videoRef.current
      },
    }))

    const containerStyle: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    }

    const videoStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      backgroundColor: '#000',
    }

    return (
      <div style={containerStyle} className="html5-player-wrapper">
        <Html5VideoPlayer
          url={url}
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          loop={loop}
          pip={pip}
          seekTo={seekToValue}
          style={videoStyle}
          onReady={() => {
            // Store ref after player is ready
            const player = document.querySelector('.html5-player-wrapper video') as HTMLVideoElement
            if (player) {
              videoRef.current = player
            }
            onReady()
          }}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onError={onError}
          onProgress={onProgress}
          onDuration={onDuration}
          onBuffer={onBuffer}
          onBufferEnd={onBufferEnd}
        />
      </div>
    )
  }
)

Html5PlayerWrapper.displayName = "Html5PlayerWrapper"

export default Html5PlayerWrapper
