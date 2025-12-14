import Layout from "../components/Layout"
import { useState, useEffect } from "react"
import InputText from "../components/input/InputText"
import Button from "../components/action/Button"
import { useRouter } from "next/router"
import { Tooltip } from "react-tooltip"
import useSWR from "swr"

interface PublicRoom {
  id: string
  ownerName: string
  memberCount: number
}

export default function Index() {
  const router = useRouter()
  const { data } = useSWR("/api/stats", (url) =>
    fetch(url).then((r) => r.json())
  )
  const { data: roomsData } = useSWR<{ rooms: PublicRoom[] }>(
    "/api/rooms",
    (url) => fetch(url).then((r) => r.json()),
    { refreshInterval: 5000 } // Auto-refresh every 5 seconds
  )
  
  const [room, setRoom] = useState("")
  const [userName, setUserName] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [nameError, setNameError] = useState("")

  // Load saved user name from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("userName")
      if (savedName) {
        setUserName(savedName)
      }
    }
  }, [])

  return (
    <Layout meta={{ robots: "index, archive, follow" }} showNavbar={false}>
      <div className={"self-center flex justify-center items-center min-h-[70vh]"}>
        <form
          className={
            "flex flex-col gap-6 justify-center rounded-xl shadow-2xl p-8 bg-gradient-to-br from-dark-800 to-dark-900 m-8 max-w-md w-full border border-dark-700/50"
          }
          onSubmit={async (e) => {
            e.preventDefault()

            if (room.length >= 4) {
              // Save user name to localStorage
              if (userName.trim() && typeof window !== "undefined") {
                localStorage.setItem("userName", userName.trim())
              }
              await router.push("/room/" + room)
            }
          }}
        >
          <div className="text-center">
            <h1 className={"text-3xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-2"}>
              Welcome to Streamer
            </h1>
            <p className="text-dark-400 text-sm">Join or create a room to watch together</p>
          </div>

          {/* User Name Input */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Your Name
            </label>
            <InputText
              value={userName}
              placeholder={"Enter your display name"}
              onChange={(value) => {
                setUserName(value)
                setNameError("")
              }}
            />
            {nameError && (
              <p className="text-red-500 text-xs mt-1">{nameError}</p>
            )}
          </div>
          
          {/* Room ID Input */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Room ID
            </label>
            <InputText
              value={room}
              placeholder={"Enter a room ID"}
              onChange={(value) =>
                setRoom(value.toLowerCase().replace(/[^a-z]/g, ""))
              }
            />
          </div>
          
          <div className={"flex gap-3 justify-end"}>
            <Button
              tooltip={"Create a new personal room"}
              className={"px-4 py-2.5 font-medium"}
              actionClasses={
                "bg-accent-600 hover:bg-accent-700 active:bg-accent-800 shadow-lg hover:shadow-xl"
              }
              onClick={() => {
                // Validate name
                if (!userName.trim()) {
                  setNameError("Please enter your name before creating a room")
                  return
                }
                
                // Save user name to localStorage
                if (typeof window !== "undefined") {
                  localStorage.setItem("userName", userName.trim())
                }
                
                fetch("/api/generate")
                  .then((r) => r.json())
                  .then(async ({ roomId }) => {
                    if (
                      typeof roomId === "string" &&
                      roomId.length >= 4 &&
                      roomId.match(/^[a-z]{4,}$/)
                    ) {
                      console.log("Generated new roomId:", roomId)
                      // Store room metadata in sessionStorage
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem(
                          `room_${roomId}_meta`,
                          JSON.stringify({ isPublic })
                        )
                      }
                      await router.push("/room/" + roomId)
                    } else {
                      throw Error("Invalid roomId generated: " + roomId)
                    }
                  })
                  .catch((error) => {
                    console.error("Failed to generate new roomId", error)
                  })
              }}
            >
              Generate room
            </Button>
            <Button
              tooltip={room.length < 4 ? "Invalid room id" : "Join room"}
              className={"px-4 py-2.5 font-medium"}
              actionClasses={
                room.length >= 4
                  ? "bg-primary-600 hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl hover:shadow-glow"
                  : "bg-dark-700 hover:bg-dark-600 active:bg-red-700 cursor-not-allowed opacity-50"
              }
              disabled={room.length < 4}
              type={"submit"}
            >
              Join room
            </Button>
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg border border-dark-700/30">
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded border-dark-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-dark-900"
              />
              <span className="text-sm text-dark-300">
                Make room public (visible in lobby)
              </span>
            </label>
          </div>
          
          <div className={"mt-2 pt-4 border-t border-dark-700/50"}>
            <small className={"text-dark-400"}>
              <div className="font-medium text-dark-300 mb-1">Currently active:</div>
              <div className={"flex flex-row gap-4 text-sm"}>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-primary-500 rounded-full"></span>
                  <span>{data?.rooms || 0} Rooms</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-accent-500 rounded-full"></span>
                  <span>{data?.users || 0} Users</span>
                </div>
              </div>
            </small>
          </div>
        </form>
      </div>

      {/* Public Rooms List */}
      {roomsData && roomsData.rooms && roomsData.rooms.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl shadow-2xl p-6 border border-dark-700/50">
            <h2 className="text-xl font-bold text-dark-200 mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary-500 rounded-full"></span>
              Public Rooms
            </h2>
            <div className="space-y-2">
              {roomsData.rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg border border-dark-700/30 hover:border-primary-500/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-dark-200">
                      Room: <span className="text-primary-400">{room.id}</span>
                    </div>
                    <div className="text-sm text-dark-400 mt-1">
                      Owner: {room.ownerName} • {room.memberCount} {room.memberCount === 1 ? "member" : "members"}
                    </div>
                  </div>
                  <Button
                    tooltip="Join this room"
                    className="px-4 py-2 text-sm font-medium"
                    actionClasses="bg-primary-600 hover:bg-primary-700 active:bg-primary-800"
                    onClick={async () => {
                      // Save user name if provided
                      if (userName.trim() && typeof window !== "undefined") {
                        localStorage.setItem("userName", userName.trim())
                      }
                      await router.push("/room/" + room.id)
                    }}
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Tooltip
        style={{
          backgroundColor: "var(--dark-700)",
          borderRadius: "0.5rem",
          padding: "0.5rem 0.75rem",
          fontSize: "0.875rem",
        }}
      />
    </Layout>
  )
}
