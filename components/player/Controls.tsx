import React, { FC, useState } from "react"
import { MediaOption, PlayerState, Subtitle } from "../../lib/types"
import InteractionHandler from "../action/InteractionHandler"
import IconBigPause from "../icon/IconBigPause"
import IconBigPlay from "../icon/IconBigPlay"
import classNames from "classnames"
import InputSlider from "../input/InputSlider"
import IconPlay from "../icon/IconPlay"
import IconPause from "../icon/IconPause"
import IconReplay from "../icon/IconReplay"
import { secondsToTime, SYNC_DELTA } from "../../lib/utils"
import IconCompress from "../icon/IconCompress"
import IconExpand from "../icon/IconExpand"
import ControlButton from "../input/ControlButton"
import VolumeControl from "./VolumeControl"
import IconBackward from "../icon/IconBackward"
import IconForward from "../icon/IconForward"
import PlayerMenu from "./PlayerMenu"
import { Tooltip } from "react-tooltip"
import IconMusic from "../icon/IconMusic"
import IconPip from "../icon/IconPip"

interface Props extends PlayerState {
  roomId: string
  setCurrentSrc: (src: MediaOption) => void
  setCurrentSub: (sub: Subtitle) => void
  setPaused: (paused: boolean) => void
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  setProgress: (progress: number) => void
  setPlaybackRate: (playbackRate: number) => void
  setFullscreen: (fullscreen: boolean) => void
  setLoop: (loop: boolean) => void
  playIndex: (index: number) => void
  setSeeking: (seeking: boolean) => void
  playAgain: () => void
  isOwner: boolean
  pipEnabled: boolean
  setPipEnabled: (enabled: boolean) => void
  musicMode: boolean
  setMusicMode: (enabled: boolean) => void
}

let interaction = false
let interactionTime = 0
let lastMouseMove = 0

const Controls: FC<Props> = ({
  roomId,
  playing,
  playlist,
  currentSrc,
  setCurrentSrc,
  currentSub,
  setCurrentSub,
  paused,
  setPaused,
  volume,
  setVolume,
  muted,
  setMuted,
  progress,
  setProgress,
  playbackRate,
  loop,
  setLoop,
  setPlaybackRate,
  fullscreen,
  setFullscreen,
  duration,
  playIndex,
  setSeeking,
  playAgain,
  isOwner,
  pipEnabled,
  setPipEnabled,
  musicMode,
  setMusicMode,
}) => {
  const [showControls, setShowControls] = useState(true)
  const [showTimePlayed, setShowTimePlayed] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  const interact = () => {
    interaction = true
    interactionTime = new Date().getTime()

    setTimeout(() => {
      if (new Date().getTime() - interactionTime > 350) {
        // Reset interaction flag
        // Double-click detection works by checking if interaction is still true
        // when the second click happens (within 400ms)
        // We don't toggle pause anymore - only show/hide controls on single tap
        interaction = false
      }
    }, 400)
  }

  const showControlsAction = (touch: boolean | null) => {
    if (!showControls) {
      setShowControls(true)
    }
    mouseMoved(touch)
  }

  const playEnded = () => {
    return paused && progress > duration - SYNC_DELTA
  }

  const openPipFallback = () => {
    // Open a small popup window as PiP fallback
    const width = 480
    const height = 270
    const left = window.screen.width - width - 20
    const top = window.screen.height - height - 100
    
    // Encode roomId to prevent any potential injection issues
    const encodedRoomId = encodeURIComponent(roomId)
    
    const pipWindow = window.open(
      `/embed/${encodedRoomId}`,
      'PiP Player',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no,location=no`
    )
    
    if (pipWindow) {
      pipWindow.focus()
      console.log("Opened PiP fallback window")
    } else {
      console.error("Failed to open PiP fallback window - popup may be blocked")
      alert("Please allow popups to use Picture-in-Picture mode")
    }
  }

  const mouseMoved = (touch: boolean | null = null) => {
    lastMouseMove = new Date().getTime()

    setTimeout(
      () => {
        if (new Date().getTime() - lastMouseMove > (touch ? 3150 : 1550)) {
          setShowControls(false)
        }
      },
      touch ? 3200 : 1600
    )
  }

  const show = showControls || menuOpen

  return (
    <>
      <InteractionHandler
        className={classNames(
          "absolute top-0 left-0 w-full h-full transition-opacity flex flex-col",
          show ? "opacity-100" : "opacity-0",
          fullscreen ? "controls-fullscreen" : ""
        )}
        onMove={(_, touch) => {
          setShowControls(!touch)
        }}
        tabIndex={1}
        onKey={(key) => {
          console.log("Key down", key)
          if (key === " ") {
            setPaused(!paused)
          }
        }}
      >
        <InteractionHandler
          className={
            "flex grow cursor-pointer items-center justify-center"
          }
          onClick={(_, touch) => {
            if (interaction) {
              // Second click detected within timeout - toggle fullscreen
              interaction = false
              console.log("Toggled fullscreen")
              setFullscreen(!fullscreen)
            } else if (touch) {
              // Single touch on mobile - show controls and toggle play/pause
              setShowControls(true)
              setMenuOpen(false)
              // Toggle play/pause on touch (owner only)
              if (isOwner) {
                if (playEnded()) {
                  playAgain()
                } else {
                  setPaused(!paused)
                }
              }
            } else {
              // Desktop click on center overlay - toggle play/pause if owner
              if (isOwner) {
                if (playEnded()) {
                  playAgain()
                } else {
                  setPaused(!paused)
                }
              }
            }

            interact()
            mouseMoved(touch)
          }}
          onMove={(_, touch) => {
            showControlsAction(!touch)
          }}
        >
          {/* Center play/pause button - positioned absolutely in center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {paused ? <IconBigPlay /> : <IconBigPause />}
          </div>
        </InteractionHandler>

        {/* Bottom control cluster: progress bar on top, control buttons below */}
        <div className="bg-dark-900/40">
          <InputSlider
            className={"bg-transparent"}
            value={progress}
            onChange={(value) => {
              setProgress(value)
              mouseMoved()
            }}
            max={duration}
            setSeeking={setSeeking}
            showValueHover={true}
          />
          <div className={"flex flex-row px-1 pb-1 items-center"}>
            {playlist.currentIndex > 0 && (
              <ControlButton
                tooltip={"Play previous"}
                onClick={() => {
                  if (show && playlist.currentIndex > 0) {
                    playIndex(playlist.currentIndex - 1)
                  }
                }}
                interaction={showControlsAction}
              >
                <IconBackward />
              </ControlButton>
            )}
            <ControlButton
              tooltip={playEnded() ? "Play again" : paused ? "Play" : "Pause"}
              onClick={() => {
                if (show && isOwner) {
                  if (playEnded()) {
                    playAgain()
                  } else {
                    setPaused(!paused)
                  }
                }
              }}
              interaction={showControlsAction}
              className={!isOwner ? "opacity-50 cursor-not-allowed" : ""}
            >
              {playEnded() ? (
                <IconReplay />
              ) : paused ? (
                <IconPlay />
              ) : (
                <IconPause />
              )}
            </ControlButton>
            {playlist.currentIndex < playlist.items.length - 1 && (
              <ControlButton
                tooltip={"Skip"}
                onClick={() => {
                  if (show && playlist.currentIndex < playlist.items.length - 1) {
                    playIndex(playlist.currentIndex + 1)
                  }
                }}
                interaction={showControlsAction}
              >
                <IconForward />
              </ControlButton>
            )}
            <VolumeControl
              muted={muted}
              setMuted={setMuted}
              volume={volume}
              setVolume={setVolume}
              interaction={showControlsAction}
            />
            <ControlButton
              tooltip={"Current progress"}
              className={"ml-auto flex items-center py-1"}
              onClick={() => {
                if (show) {
                  setShowTimePlayed(!showTimePlayed)
                }
              }}
              interaction={showControlsAction}
            >
              <span>
                {(showTimePlayed
                  ? secondsToTime(progress)
                  : "-" + secondsToTime(duration - progress)) +
                  " / " +
                  secondsToTime(duration)}
              </span>
            </ControlButton>

            {/* PiP button - swapped position with Fullscreen */}
            <ControlButton
              tooltip={pipEnabled ? "Exit PiP" : "Enter PiP"}
              onClick={async () => {
                if (pipEnabled) {
                  // Exit PiP
                  setPipEnabled(false)
                  if (document.pictureInPictureElement) {
                    try {
                      await document.exitPictureInPicture()
                    } catch (err) {
                      console.warn("Failed to exit PiP:", err)
                    }
                  }
                } else {
                  // Try to enter PiP
                  // Robust YouTube URL detection with proper hostname validation
                  let isYouTube = false
                  try {
                    const url = new URL(currentSrc.src)
                    const hostname = url.hostname.toLowerCase()
                    // Check for exact match or subdomain of youtube.com or youtu.be
                    isYouTube = hostname === 'youtube.com' || 
                                hostname === 'www.youtube.com' ||
                                hostname === 'm.youtube.com' ||
                                hostname === 'gaming.youtube.com' ||
                                hostname === 'youtu.be' ||
                                hostname === 'www.youtu.be' ||
                                hostname.endsWith('.youtube.com') ||
                                hostname.endsWith('.youtu.be')
                  } catch (e) {
                    // Invalid URL, treat as non-YouTube
                    isYouTube = false
                  }
                  
                  if (isYouTube) {
                    // For YouTube, use ReactPlayer's pip prop
                    setPipEnabled(true)
                    if (!pipEnabled && musicMode) {
                      setMusicMode(false)
                    }
                  } else {
                    // For file sources, try native PiP API
                    // Note: We query for the first video element on the page.
                    // This works for the current app structure where there's only one video player.
                    // If multiple video elements exist, this might select the wrong one.
                    const videoElement = document.querySelector('video')
                    
                    // Check if native PiP is supported and available
                    const nativePipSupported = videoElement && 
                      'requestPictureInPicture' in videoElement && 
                      document.pictureInPictureEnabled &&
                      videoElement.disablePictureInPicture !== true
                    
                    if (nativePipSupported && videoElement) {
                      try {
                        await videoElement.requestPictureInPicture()
                        setPipEnabled(true)
                        if (musicMode) {
                          setMusicMode(false)
                        }
                      } catch (err) {
                        console.warn("Native PiP failed:", err)
                        // Native PiP failed - use fallback popup
                        // Call synchronously since we're still in the click handler context
                        openPipFallback()
                      }
                    } else {
                      // Fallback: open popup window immediately in click context
                      openPipFallback()
                    }
                  }
                }
              }}
              interaction={showControlsAction}
            >
              <IconPip />
            </ControlButton>

            <PlayerMenu
              roomId={roomId}
              playing={playing}
              currentSrc={currentSrc}
              setCurrentSrc={setCurrentSrc}
              currentSub={currentSub}
              setCurrentSub={setCurrentSub}
              loop={loop}
              setLoop={setLoop}
              interaction={showControlsAction}
              playbackRate={playbackRate}
              setPlaybackRate={setPlaybackRate}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
            />

            <ControlButton
              tooltip={
                !isOwner
                  ? musicMode
                    ? "Music mode ON (owner only)"
                    : "Music mode (owner only)"
                  : musicMode
                  ? "Exit music mode"
                  : "Enter music mode"
              }
              onClick={() => {
                if (isOwner) {
                  setMusicMode(!musicMode)
                  if (!musicMode && pipEnabled) {
                    setPipEnabled(false)
                  }
                }
              }}
              interaction={showControlsAction}
              className={classNames(
                !isOwner && "opacity-50 cursor-not-allowed",
                musicMode && !isOwner && "text-primary-400"
              )}
            >
              <IconMusic />
            </ControlButton>

            {/* Fullscreen button - swapped position with PiP */}
            <ControlButton
              tooltip={fullscreen ? "Leave fullscreen" : "Enter fullscreen"}
              onClick={async () => {
                console.log("Toggled fullscreen")
                const newFullscreen = !fullscreen
                await setFullscreen(newFullscreen)
                
                // Handle screen orientation for mobile devices
                if ('screen' in window && 'orientation' in window.screen) {
                  try {
                    // Use type assertion for Screen Orientation API (not fully typed in TS)
                    const orientation = window.screen.orientation as ScreenOrientation & {
                      lock?: (orientation: string) => Promise<void>
                    }
                    if (newFullscreen && orientation.lock) {
                      // Lock to landscape when entering fullscreen
                      await orientation.lock('landscape')
                    } else {
                      // Unlock orientation when exiting fullscreen
                      orientation.unlock()
                    }
                  } catch (err) {
                    // Orientation lock not supported or failed - this is expected on desktop
                    console.log("Screen orientation lock not available:", err)
                  }
                }
              }}
              interaction={showControlsAction}
            >
              {fullscreen ? <IconCompress /> : <IconExpand />}
            </ControlButton>
          </div>
        </div>
      </InteractionHandler>

      <Tooltip
        style={{
          backgroundColor: "var(--dark-700)",
        }}
      />
    </>
  )
}

export default Controls
