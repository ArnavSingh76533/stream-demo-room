import React, { FC, useEffect, useState, useRef } from "react"
import { Draggable as _Draggable, DraggableProps } from "react-beautiful-dnd"
import classNames from "classnames"
import { MediaElement } from "../../lib/types"
import NewTabLink from "../action/NewTabLink"
import IconNewTab from "../icon/IconNewTab"
import IconDrag from "../icon/IconDrag"
import DeleteButton from "../action/DeleteButton"
import InputText from "../input/InputText"
import ControlButton from "../input/ControlButton"
import IconPlay from "../icon/IconPlay"
import IconDisk from "../icon/IconDisk"

// HACK: this fixes type incompatibility
const Draggable = _Draggable as unknown as FC<DraggableProps>

interface Props {
  playing: boolean
  item: MediaElement
  index: number
  play: () => void
  deleteItem: (index: number) => void
  updateTitle: (title: string) => void
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
const getYouTubeVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Check for YouTube domains
    const isYouTube = hostname === 'youtube.com' || 
                      hostname === 'www.youtube.com' ||
                      hostname === 'm.youtube.com' ||
                      hostname.endsWith('.youtube.com') ||
                      hostname === 'youtu.be' ||
                      hostname === 'www.youtu.be'
    
    if (!isYouTube) return null
    
    // Handle youtu.be short URLs
    if (hostname === 'youtu.be' || hostname === 'www.youtu.be') {
      return urlObj.pathname.slice(1) || null
    }
    
    // Handle youtube.com URLs
    const videoId = urlObj.searchParams.get('v')
    if (videoId) return videoId
    
    // Handle embed URLs: youtube.com/embed/VIDEO_ID
    if (urlObj.pathname.startsWith('/embed/')) {
      return urlObj.pathname.split('/')[2] || null
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Get thumbnail URL for a media item
 */
const getThumbnailUrl = (item: MediaElement): string | null => {
  // If item has explicit thumbnail, use it
  if (item.thumbnail) return item.thumbnail
  
  // Try to extract from YouTube URL
  const src = item.src?.[0]?.src
  if (!src) return null
  
  const youtubeId = getYouTubeVideoId(src)
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
  }
  
  return null
}

const titleGen = (item: MediaElement) => {
  if (item.title && item.title !== "") {
    return item.title
  }
  // Show "Unknown" if no title, with the domain in URL
  return "Unknown"
}

const PlaylistItem: FC<Props> = ({
  playing,
  item,
  index,
  play,
  deleteItem,
  updateTitle,
}) => {
  const [edit, setEdit] = useState(false)
  const [title, setTitle] = useState(item.title || "")
  const prevEdit = useRef(false)

  useEffect(() => {
    if (prevEdit.current !== edit) {
      if (!edit) {
        if (item.title !== title) {
          updateTitle(title || "")
        }
      }

      prevEdit.current = edit
    }

    if (item.title && item.title !== "" && item.title !== title) {
      setTitle(item.title || "")
    }
  }, [edit, item.title, title])

  const thumbnailUrl = getThumbnailUrl(item)

  return (
    <Draggable
      key={(item.src?.[0]?.src || 'unknown') + "-" + index}
      draggableId={"playlistMenu-item-" + index}
      index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={provided.draggableProps.style}
          className={classNames(
            "p-2 rounded-lg flex flex-row gap-2 border transition-all duration-200",
            snapshot.isDragging 
              ? "bg-dark-700 border-primary-500/50 shadow-glow" 
              : playing 
                ? "bg-dark-800 border-primary-600/50" 
                : "bg-dark-800/50 border-dark-700/50 hover:bg-dark-800"
          )}
        >
          {/* Drag handle */}
          <div
            className={classNames(
              "p-1 transition-colors hover:text-primary-500 cursor-grab active:cursor-grabbing self-center",
              snapshot.isDragging && "text-primary-500"
            )}
            {...provided.dragHandleProps}
          >
            <IconDrag />
          </div>

          {/* Thumbnail */}
          <div className="flex-shrink-0 self-center">
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={thumbnailUrl} 
                alt="" 
                className="w-16 h-10 object-cover rounded border border-dark-700/30"
              />
            ) : (
              <div className="w-16 h-10 bg-dark-700 rounded border border-dark-700/30 flex items-center justify-center">
                <IconPlay className="text-dark-500 w-4 h-4" />
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="flex-grow min-w-0 flex flex-col justify-center gap-1">
            {/* Title */}
            <div
              className={"flex"}
              onMouseEnter={() => setEdit(true)}
              onMouseLeave={() => setEdit(false)}
            >
              {edit ? (
                <InputText
                  onChange={setTitle}
                  placeholder={"Set a title"}
                  value={title}
                />
              ) : (
                <span className={classNames("text-sm font-medium truncate", playing && "text-primary-400")}>
                  {titleGen(item)}
                </span>
              )}
            </div>
            {/* URL */}
            <div className="text-xs text-dark-500 truncate">
              {item.src?.[0]?.src || 'Unknown URL'}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-row items-center gap-1 flex-shrink-0">
            <ControlButton
              tooltip={playing ? "Currently playing" : "Play item now"}
              onClick={() => {
                if (!playing) {
                  play()
                }
              }}
              interaction={() => {}}
            >
              {playing ? (
                <IconDisk
                  className={"animate-spin animate-pulse text-purple-500"}
                />
              ) : (
                <IconPlay
                  className={"text-primary-500 hover:text-primary-400"}
                />
              )}
            </ControlButton>
            <NewTabLink
              href={item.src?.[0]?.src || '#'}
              className={"p-1 text-dark-400 hover:text-primary-500 transition-colors"}
              title="Open in new tab"
            >
              <IconNewTab className={"w-4 h-4"} />
            </NewTabLink>
            <DeleteButton
              tooltip={"Delete " + (title || titleGen(item))}
              onClick={() => deleteItem(index)}
            />
          </div>
        </div>
      )}
    </Draggable>
  )
}

export default PlaylistItem