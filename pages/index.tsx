import Layout from "../components/Layout"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Play, Users, ChevronRight, Search, Settings, ChevronDown } from "lucide-react"
import { cn } from "@/lib/cn"

interface PublicRoom {
  id: string
  ownerName: string
  memberCount: number
}

interface Stats {
  rooms: number
  users: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Index() {
  const router = useRouter()
  const [room, setRoom] = useState("")
  const [userName, setUserName] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [nameError, setNameError] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { data: stats, isLoading: statsLoading } = useSWR<Stats>("/api/stats", fetcher)
  const { data: roomsData, isLoading: roomsLoading } = useSWR<{ rooms: PublicRoom[] }>(
    "/api/rooms",
    fetcher,
    { refreshInterval: 5000 }
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("userName")
      if (savedName) {
        setUserName(savedName)
      }
    }
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleJoinRoom = async (roomId: string) => {
    // Save user name if provided
    if (userName.trim() && typeof window !== "undefined") {
      localStorage.setItem("userName", userName.trim())
    }
    await router.push("/room/" + roomId)
  }

  const handleGenerateRoom = () => {
    // Validate name
    if (!userName.trim()) {
      setNameError("Please enter your name before creating a room")
      return
    }
    
    setIsGenerating(true)
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
        setIsGenerating(false)
      })
  }

  return (
    <Layout meta={{ robots: "index, archive, follow" }} showNavbar={false}>
      <div className="min-h-screen bg-[#0B0E13]">
        <nav
          className={cn(
            "fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-6 transition-all duration-200",
            scrolled ? "bg-[#0B0E13]/95 backdrop-blur-sm border-b border-white/[0.04]" : "bg-transparent",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center">
              <Play className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Streamer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.06] flex items-center justify-center transition-colors duration-150">
              <Search className="w-4 h-4 text-white/40" />
            </button>
            <button className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.06] flex items-center justify-center transition-colors duration-150">
              <Settings className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </nav>

        <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E13] via-[#0B0E13] to-[#0B0E13]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-[#3B82F6]/[0.06] blur-[100px] animate-pulse-slow" />
          <div
            className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] rounded-full bg-[#8B5CF6]/[0.05] blur-[80px] animate-pulse-slow"
            style={{ animationDelay: "3s" }}
          />

          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center animate-fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white mb-4">
              Watch Together,
              <br />
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                Stream Anywhere
              </span>
            </h1>
            <p className="text-sm text-white/25 max-w-sm mx-auto mb-8 font-light">
              Create a room and invite friends to watch in perfect sync
            </p>

            <Button
              size="lg"
              onClick={() => {
                const formSection = document.getElementById("join-section")
                formSection?.scrollIntoView({ behavior: "smooth" })
              }}
              className="group h-12 px-8 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#4B8FF7] hover:to-[#9B6CF7] text-white text-base font-semibold rounded-2xl shadow-[0_0_24px_rgba(59,130,246,0.2)] hover:shadow-[0_0_32px_rgba(59,130,246,0.3)] transition-all duration-150 active:scale-[0.98]"
            >
              <Play className="w-4 h-4 mr-2 fill-white" />
              Get Started
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-150" />
            </Button>

            <div className="flex items-center justify-center gap-2.5 mt-6">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02]">
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="text-[11px] text-white/20">
                  {mounted && !statsLoading ? (stats?.rooms ?? 0) : "—"} Rooms
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02]">
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="text-[11px] text-white/20">
                  {mounted && !statsLoading ? (stats?.users ?? 0) : "—"} Watching
                </span>
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-fade-in opacity-0"
            style={{ animationDelay: "500ms", animationFillMode: "forwards" }}
          >
            <span className="text-[9px] text-white/15 font-medium tracking-wider uppercase">Scroll</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/15 animate-bounce-subtle" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B0E13] via-[#0B0E13]/90 to-transparent pointer-events-none" />
        </div>

        <div id="join-section" className="w-full max-w-6xl mx-auto px-6 py-10">
          {roomsData && roomsData.rooms && roomsData.rooms.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Trending Now</h2>
                <span className="text-[11px] text-white/20">{roomsData.rooms.length} active</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {roomsData.rooms.map((publicRoom, idx) => (
                  <button
                    key={publicRoom.id}
                    onClick={() => handleJoinRoom(publicRoom.id)}
                    className={cn(
                      "group relative rounded-xl overflow-hidden transition-all duration-150 text-left",
                      "bg-[#12151B] border border-white/[0.04]",
                      "hover:border-white/[0.08] hover:scale-[1.01]",
                      idx === 0 && "col-span-2 row-span-1 md:col-span-2",
                    )}
                    style={{ animation: `fade-up 150ms ease-out ${200 + idx * 40}ms both` }}
                  >
                    <div className="relative aspect-video bg-[#0B0E13] overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white/30" />
                      </div>
                      <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]" />

                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-150">
                          <Play className="w-4 h-4 fill-[#0B0E13] text-[#0B0E13] ml-0.5" />
                        </div>
                      </div>

                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/50">
                        <span className="text-[9px] text-white/40 font-medium">Live</span>
                      </div>

                      {idx === 0 && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">
                          <span className="text-[9px] text-white font-medium">Featured</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <div className="text-sm font-medium text-white/70 truncate">{publicRoom.ownerName}&apos;s Room</div>
                      <div className="flex items-center gap-1 text-[10px] text-white/20 mt-1">
                        <Users className="w-3 h-3" />
                        <span>{publicRoom.memberCount} watching</span>
                      </div>
                    </div>
                  </button>
                ))}

                {!mounted || (roomsLoading && (!roomsData || roomsData.rooms.length === 0)) ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-xl overflow-hidden bg-[#12151B] border border-white/[0.04]",
                          i === 1 && "col-span-2",
                        )}
                      >
                        <Skeleton className="aspect-video w-full bg-white/[0.02]" />
                        <div className="p-3 space-y-2">
                          <Skeleton className="h-4 w-3/4 bg-white/[0.02]" />
                          <Skeleton className="h-3 w-1/3 bg-white/[0.02]" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : null}
              </div>
            </div>
          )}

          <Card className="max-w-md mx-auto bg-[#12151B] border-white/[0.04] rounded-xl">
            <CardContent className="pt-6 pb-6">
              <div className="text-center mb-5">
                <h2 className="text-base font-semibold text-white mb-1">Create Your Room</h2>
                <p className="text-[11px] text-white/25">Start streaming together in seconds</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (room.length >= 4) {
                    handleJoinRoom(room)
                  }
                }}
                className="space-y-3.5"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="userName" className="text-[11px] font-medium text-white/40">
                    Your Name
                  </Label>
                  <Input
                    id="userName"
                    value={userName}
                    placeholder="Enter your display name"
                    onChange={(e) => {
                      setUserName(e.target.value)
                      setNameError("")
                    }}
                    className={cn(
                      "bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/15 h-10 rounded-lg text-sm",
                      "focus-visible:ring-[#3B82F6]/15 focus-visible:border-white/[0.1] transition-all duration-150",
                      nameError && "border-red-500/40",
                    )}
                  />
                  {nameError && <p className="text-[10px] text-red-400/80">{nameError}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="roomId" className="text-[11px] font-medium text-white/40">
                    Room ID <span className="text-white/15 font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="roomId"
                    value={room}
                    placeholder="Enter a room ID to join"
                    onChange={(e) => setRoom(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))}
                    className="bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/15 h-10 rounded-lg text-sm focus-visible:ring-[#3B82F6]/15 focus-visible:border-white/[0.1] transition-all duration-150"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <Label htmlFor="public-toggle" className="cursor-pointer text-[11px] text-white/30">
                    Make room public
                  </Label>
                  <Switch
                    id="public-toggle"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    className="scale-[0.85]"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-10 bg-transparent border-white/[0.06] text-white/35 hover:bg-white/[0.03] hover:text-white/50 hover:border-white/[0.08] rounded-lg text-sm transition-all duration-150 active:scale-[0.98]"
                    onClick={handleGenerateRoom}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Creating..." : "Generate"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={room.length < 4}
                    className="flex-1 h-10 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#4B8FF7] hover:to-[#9B6CF7] text-white font-medium rounded-lg text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    Join Room
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
