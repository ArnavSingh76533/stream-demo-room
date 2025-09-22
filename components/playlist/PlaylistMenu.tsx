import { FC, useEffect, useRef, useState } from "react"
import { MediaElement, Playlist, RoomState } from "../../lib/types"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import classNames from "classnames"
import { Socket } from "socket.io-client"
import {
  ClientToServerEvents,
  playItemFromPlaylist,
  ServerToClientEvents,
} from "../../lib/socket"
import ControlButton from "../input/ControlButton"
import IconChevron from "../icon/IconChevron"
import PlaylistItem from "./PlaylistItem"
import InputUrl from "../input/InputUrl"

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>
}

const PlaylistMenu: FC<Props> = ({ socket }) => {
  const [expanded, setExpanded] = useState(true)
  const [url, setUrl] = useState("")

  const [playlist, _setPlaylist] = useState<Playlist>({
    items: [],
    currentIndex: -1,
  })
  const playlistRef = useRef(playlist)
  const setPlaylist = (newPlaylist: Playlist) => {
    _setPlaylist(newPlaylist)
    playlistRef.current = newPlaylist
  }

  useEffect(() => {
    socket.on("update", (room: RoomState) => {
      if (
        JSON.stringify(room.targetState.playlist) !==
        JSON.stringify(playlistRef.current)
      ) {
        setPlaylist(room.targetState.playlist)
      }
    })
  }, [socket])

  const addItem = (newUrl: string) => {
    if (newUrl === "") {
      return
    }
    setUrl("")

    const newMedia: MediaElement = {
      src: [
        {
          src: newUrl,
          resolution: "",
        },
      ],
      sub: [],
    }
    const newPlaylist: Playlist = JSON.parse(JSON.stringify(playlist))
    newPlaylist.items.push(newMedia)
    socket.emit("updatePlaylist", newPlaylist)
  }

  return (
    <div className={classNames("flex flex-col", expanded && "sm:w-[300px]")}>
      <ControlButton
        tooltip={expanded ? "Hide playlist" : "Show playlist"}
        onClick={() => setExpanded(!expanded)}
        interaction={() => {}}
        className={"flex flex-row gap-1"}
      >
        <IconChevron
          direction={expanded ? "up" : "down"}
          className={"sm:rotate-90"}
        />
        <div className={classNames(!expanded && "sm:hidden")}>
          {expanded ? "Hide" : "Show"} Playlist
        </div>
      </ControlButton>
      {expanded && (
        <>
          <InputUrl
            url={url}
            placeholder={"Add url..."}
            tooltip={"Add url to the playlist"}
            onChange={setUrl}
            className={"my-1"}
            onSubmit={() => addItem(url)}
          >
            Add
          </InputUrl>
          <DragDropContext
            onDragEnd={(result) => {
              if (!result.destination) {
                return
              }

              const newPlaylist: Playlist = JSON.parse(JSON.stringify(playlist))
              newPlaylist.items.splice(result.source.index, 1)
              newPlaylist.items.splice(
                result.destination.index,
                0,
                playlist.items[result.source.index]
              )

              if (
                newPlaylist.currentIndex === result.source.index ||
                newPlaylist.currentIndex === result.destination.index
              ) {
                // keep currentIndex pointing to the same item after reorder
                const movedFrom = result.source.index
                const movedTo = result.destination.index
                if (newPlaylist.currentIndex === movedFrom) {
                  newPlaylist.currentIndex = movedTo
                } else if (
                  movedFrom < newPlaylist.currentIndex &&
                  movedTo >= newPlaylist.currentIndex
                ) {
                  newPlaylist.currentIndex -= 1
                } else if (
                  movedFrom > newPlaylist.currentIndex &&
                  movedTo <= newPlaylist.currentIndex
                ) {
                  newPlaylist.currentIndex += 1
                }
              }

              socket.emit("updatePlaylist", newPlaylist)
            }}
          >
            <Droppable droppableId={"playlistMenu"}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className={"flex flex-col gap-1"}>
                  {playlist.items.map((item, index) => (
                    <PlaylistItem
                      key={item.src[0].src + "-" + index}
                      item={item}
                      index={index}
                      updateTitle={(title: string) => {
                        const newPlaylist: Playlist = JSON.parse(JSON.stringify(playlist))
                        newPlaylist.items[index].title = title
                        socket.emit("updatePlaylist", newPlaylist)
                      }}
                      deleteItem={(i: number) => {
                        const newPlaylist: Playlist = JSON.parse(JSON.stringify(playlist))
                        newPlaylist.items.splice(i, 1)
                        if (newPlaylist.currentIndex >= newPlaylist.items.length) {
                          newPlaylist.currentIndex = newPlaylist.items.length - 1
                        }
                        socket.emit("updatePlaylist", newPlaylist)
                      }}
                      playing={playlist.currentIndex === index}
                      play={() => playItemFromPlaylist(socket, index)}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}
    </div>
  )
}

export default PlaylistMenu