"use client"
import { useState } from "react"
import Layout from "../components/Layout"

// Demo room page - opens without websockets, shows demo photo at video player
// All elements are included for design customization

// ============= ICON COMPONENTS =============
const IconPlay = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const IconPause = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
)

const IconBigPlay = () => (
  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
    <svg className="w-8 h-8 ml-1" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  </div>
)

const IconVolume = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
)

const IconMuted = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
)

const IconExpand = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
)

const IconLoop = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
  </svg>
)

const IconSettings = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
)

const IconChevron = ({ direction = "down" }: { direction?: "up" | "down" }) => (
  <svg
    className={`w-5 h-5 transition-transform ${direction === "up" ? "rotate-180" : ""}`}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
  </svg>
)

const IconBackward = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
  </svg>
)

const IconForward = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
  </svg>
)

const IconMusic = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </svg>
)

const IconPip = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
  </svg>
)

const IconDelete = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
)

// ============= DEMO DATA =============
const demoPlaylist = [
  { title: "Big Buck Bunny", url: "https://example.com/big-buck-bunny.mp4", playing: true },
  { title: "Sintel", url: "https://example.com/sintel.mp4", playing: false },
  { title: "Elephants Dream", url: "https://example.com/elephants-dream.mp4", playing: false },
]

const demoChatMessages = [
  { id: "1", name: "Alice", text: "Hey everyone! 👋", time: "10:23 AM" },
  { id: "2", name: "Bob", text: "What are we watching today?", time: "10:24 AM" },
  { id: "3", name: "Charlie", text: "Let's watch Big Buck Bunny!", time: "10:25 AM" },
  { id: "4", name: "Alice", text: "Sounds good to me!", time: "10:25 AM" },
]

const demoUsers = [
  { name: "You", isOwner: true, isSelf: true },
  { name: "Alice", isOwner: false, isSelf: false },
  { name: "Bob", isOwner: false, isSelf: false },
  { name: "Charlie", isOwner: false, isSelf: false },
]

// ============= HELPER FUNCTIONS =============
const secondsToTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }
  return `${m}:${s.toString().padStart(2, "0")}`
}

// ============= CONTROL BUTTON COMPONENT =============
const ControlButton = ({
  children,
  tooltip,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  tooltip: string
  onClick?: () => void
  className?: string
}) => (
  <button
    className={`p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all duration-200 ${className}`}
    title={tooltip}
    onClick={onClick}
  >
    {children}
  </button>
)

// ============= MAIN DEMO ROOM COMPONENT =============
export default function RoomDemoPage() {
  const [paused, setPaused] = useState(true)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(80)
  const [progress, setProgress] = useState(125)
  const [playlistExpanded, setPlaylistExpanded] = useState(true)
  const [chatText, setChatText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const duration = 596 // Demo duration in seconds

  return (
    <Layout
      meta={{
        title: "Demo Room",
        description: "Room design demo - no websockets required",
      }}
      roomId="demo"
    >
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Main content area */}
        <div className="grow">
          {/* ============= VIDEO PLAYER ============= */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {/* Demo placeholder image */}
            <div
              className="video-normal w-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                <div className="w-32 h-32 mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="text-xl font-medium">Demo Video Player</div>
                <div className="text-sm text-white/40 mt-2">Click play to start watching</div>
              </div>
            </div>

            {/* Player Controls Overlay */}
            <div className="absolute inset-0 flex flex-col opacity-100 transition-opacity">
              {/* Center play button */}
              <div
                className="flex-1 flex items-center justify-center cursor-pointer"
                onClick={() => setPaused(!paused)}
              >
                {paused && <IconBigPlay />}
              </div>

              {/* Bottom control bar */}
              <div className="bg-dark-900/60 backdrop-blur-sm">
                <div className="flex flex-row px-1 py-0.5 items-center gap-0.5">
                  <ControlButton tooltip="Previous" onClick={() => {}}>
                    <IconBackward />
                  </ControlButton>
                  <ControlButton
                    tooltip={paused ? "Play" : "Pause"}
                    onClick={() => setPaused(!paused)}
                  >
                    {paused ? <IconPlay /> : <IconPause />}
                  </ControlButton>
                  <ControlButton tooltip="Next" onClick={() => {}}>
                    <IconForward />
                  </ControlButton>

                  {/* Volume control */}
                  <div className="flex items-center gap-1 px-2 group">
                    <ControlButton
                      tooltip={muted ? "Unmute" : "Mute"}
                      onClick={() => setMuted(!muted)}
                    >
                      {muted ? <IconMuted /> : <IconVolume />}
                    </ControlButton>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={muted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value))
                        if (Number(e.target.value) > 0) setMuted(false)
                      }}
                      className="w-20 h-1 accent-primary-500 cursor-pointer"
                    />
                  </div>

                  {/* Time display */}
                  <div className="ml-auto flex items-center gap-2 px-2">
                    <span className="text-sm text-white/80">
                      {secondsToTime(progress)} / {secondsToTime(duration)}
                    </span>
                  </div>

                  <ControlButton tooltip="Picture in Picture" onClick={() => {}}>
                    <IconPip />
                  </ControlButton>
                  <ControlButton tooltip="Settings" onClick={() => {}}>
                    <IconSettings />
                  </ControlButton>
                  <ControlButton tooltip="Music Mode" onClick={() => {}}>
                    <IconMusic />
                  </ControlButton>
                  <ControlButton tooltip="Fullscreen" onClick={() => {}}>
                    <IconExpand />
                  </ControlButton>
                </div>

                {/* Progress bar */}
                <div className="px-2 pb-1">
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full h-1 accent-primary-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Manual sync and URL input bar */}
          <div className="flex flex-row gap-2 p-2 bg-dark-900/50 rounded-lg border border-dark-700/50 mt-2">
            <button className="px-3 py-2 flex flex-row gap-2 items-center bg-dark-800 hover:bg-dark-700 active:bg-dark-600 border border-dark-700/50 rounded-lg transition-all">
              <IconLoop />
              <span className="hidden sm:inline">Manual sync</span>
            </button>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Play url now"
                className="flex-1 bg-dark-800 border border-dark-700/50 focus:border-primary-500/50 p-2.5 rounded-lg outline-none transition-all duration-200"
              />
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 rounded-lg font-medium transition-all">
                Play
              </button>
            </div>
          </div>

          {/* ============= CHAT + YOUTUBE SEARCH ============= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2 mt-2">
            {/* Chat Panel */}
            <div className="flex flex-col h-64 border border-dark-700/50 rounded-xl overflow-hidden shadow-lg bg-dark-900">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-dark-900/50 flex flex-col-reverse">
                {demoChatMessages
                  .slice()
                  .reverse()
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className="text-sm bg-dark-800/50 rounded-lg p-3 border border-dark-700/30"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-primary-400">{msg.name}</span>
                        <span className="text-dark-500 text-xs">•</span>
                        <span className="text-dark-500 text-xs">{msg.time}</span>
                      </div>
                      <div className="break-words text-dark-200">{msg.text}</div>
                    </div>
                  ))}
              </div>
              <div className="p-3 flex gap-2 bg-dark-800/50 border-t border-dark-700/50">
                <input
                  className="input flex-1 bg-dark-800 border border-dark-700/50 focus:border-primary-500/50 p-2.5 rounded-lg outline-none transition-all duration-200"
                  placeholder="Type a message…"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                />
                <button className="btn bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-glow">
                  Send
                </button>
              </div>
            </div>

            {/* YouTube Search */}
            <div className="flex flex-col gap-3 bg-dark-900 border border-dark-700/50 rounded-xl p-4 shadow-lg">
              <h3 className="text-lg font-semibold text-primary-400 mb-1">YouTube Search</h3>

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  className="input bg-dark-800 border border-dark-700/50 focus:border-primary-500/50 p-2.5 rounded-lg outline-none transition-all duration-200"
                  placeholder="Search YouTube (e.g., music, movies)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-4 rounded-lg justify-center font-medium transition-all duration-200 shadow-md hover:shadow-glow w-20">
                  Search
                </button>
              </div>

              {/* Demo search results */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-dark-400">3 demo results</span>
                </div>

                <div className="grid gap-2 max-h-40 overflow-y-auto">
                  {[
                    { title: "Big Buck Bunny - Full Movie", url: "youtube.com/watch?v=xxx1" },
                    { title: "Sintel - Open Movie", url: "youtube.com/watch?v=xxx2" },
                    { title: "Elephants Dream", url: "youtube.com/watch?v=xxx3" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 p-3 rounded-lg border border-dark-700/50 bg-dark-800/50 hover:bg-dark-800 transition-all duration-200"
                    >
                      <div className="w-20 h-12 bg-dark-700 rounded-md border border-dark-700/30 flex items-center justify-center">
                        <IconPlay />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-dark-200">{item.title}</div>
                        <div className="text-dark-500 text-xs truncate">{item.url}</div>
                      </div>
                      <button className="btn bg-accent-600 hover:bg-accent-700 active:bg-accent-800 px-3 py-1.5 rounded-lg text-xs justify-center font-medium transition-all duration-200 w-14">
                        Add
                      </button>
                      <button className="btn bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-3 py-1.5 rounded-lg justify-center font-medium transition-all duration-200 shadow-md hover:shadow-glow w-20">
                        Play
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ============= USER LIST ============= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 p-2">
            {demoUsers.map((user, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                  user.isSelf
                    ? "bg-primary-900/20 border-primary-700/50"
                    : "bg-dark-800/50 border-dark-700/50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    user.isOwner
                      ? "bg-primary-600 text-white"
                      : "bg-dark-700 text-dark-300"
                  }`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-dark-200">
                    {user.name}
                    {user.isSelf && (
                      <span className="ml-2 text-xs text-primary-400">(You)</span>
                    )}
                  </div>
                  {user.isOwner && (
                    <div className="text-xs text-primary-400">Room Owner</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============= PLAYLIST SIDEBAR ============= */}
        <div
          className={`flex flex-col bg-dark-900/50 rounded-xl border border-dark-700/50 overflow-hidden ${
            playlistExpanded ? "sm:w-[320px]" : ""
          }`}
        >
          <button
            onClick={() => setPlaylistExpanded(!playlistExpanded)}
            className="flex flex-row gap-2 items-center justify-center bg-dark-800 hover:bg-dark-700 p-3 font-medium transition-all"
          >
            <IconChevron direction={playlistExpanded ? "up" : "down"} />
            <span className={playlistExpanded ? "" : "sm:hidden"}>
              {playlistExpanded ? "Hide" : "Show"} Playlist
            </span>
          </button>

          {playlistExpanded && (
            <div className="p-2">
              {/* Add URL input */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add url..."
                  className="flex-1 bg-dark-800 border border-dark-700/50 focus:border-primary-500/50 p-2.5 rounded-lg outline-none transition-all duration-200"
                />
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 rounded-lg font-medium transition-all">
                  Add
                </button>
              </div>

              {/* Playlist items */}
              <div className="flex flex-col gap-2 min-h-[100px] p-2 rounded-lg">
                {demoPlaylist.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 ${
                      item.playing
                        ? "bg-primary-900/20 border-primary-700/50"
                        : "bg-dark-800/50 border-dark-700/50 hover:bg-dark-800"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm">
                        {item.playing && (
                          <span className="text-primary-400 mr-2">▶</span>
                        )}
                        {item.title}
                      </div>
                      <div className="text-xs text-dark-500 truncate">{item.url}</div>
                    </div>
                    <button
                      className="p-1.5 rounded hover:bg-dark-600 text-dark-400 hover:text-white transition-all"
                      title="Remove"
                    >
                      <IconDelete />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
