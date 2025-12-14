"use client"
import { FC, useEffect, useRef, useState } from "react"
import { Socket } from "socket.io-client"
import { ClientToServerEvents, ServerToClientEvents } from "../../lib/socket"

type ChatMessage = {
  id: string
  userId: string
  name: string
  text: string
  ts: number
}

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>
  className?: string
}

const ChatPanel: FC<Props> = ({ socket, className }) => {
  const [messages, _setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState("")
  const messagesRef = useRef(messages)
  const setMessages = (m: ChatMessage[]) => {
    messagesRef.current = m
    _setMessages(m)
  }

  useEffect(() => {
    const onHistory = (history: ChatMessage[]) => {
      setMessages(history)
    }
    const onNew = (msg: ChatMessage) => {
      setMessages([...messagesRef.current, msg].slice(-200))
      // Play notification sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch (err) {
        console.log("Audio notification failed:", err)
      }
    }

    socket.on("chatHistory", onHistory)
    socket.on("chatNew", onNew)
    return () => {
      socket.off("chatHistory", onHistory)
      socket.off("chatNew", onNew)
    }
  }, [socket])

  const send = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    socket.emit("chatMessage", trimmed)
    setText("")
  }

  return (
    <div className={className ?? "flex flex-col h-64 border border-dark-700/50 rounded-xl overflow-hidden shadow-lg bg-dark-900"}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-dark-900/50 flex flex-col-reverse">
        {messages.length === 0 ? (
          <div className="text-dark-500 text-sm text-center py-8">
            No messages yet. Be the first to say hello! 👋
          </div>
        ) : (
          [...messages].reverse().map((m) => (
            <div key={m.id} className="text-sm bg-dark-800/50 rounded-lg p-3 border border-dark-700/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-primary-400">{m.name}</span>
                <span className="text-dark-500 text-xs">•</span>
                <span className="text-dark-500 text-xs">{new Date(m.ts).toLocaleTimeString()}</span>
              </div>
              <div className="break-words text-dark-200">{m.text}</div>
            </div>
          ))
        )}
      </div>
      <div className="p-3 flex gap-2 bg-dark-800/50 border-t border-dark-700/50">
        <input
          className="input flex-1 bg-dark-800 border border-dark-700/50 focus:border-primary-500/50 p-2.5 rounded-lg outline-none transition-all duration-200"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send()
          }}
        />
        <button 
          className="btn bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-glow" 
          onClick={send}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatPanel
