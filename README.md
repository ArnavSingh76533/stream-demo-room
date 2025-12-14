---
title: Streamer
emoji: 🎵
colorFrom: pink
colorTo: indigo
sdk: docker  # or gradio, streamlit, static
app_file: app.py
pinned: false
---

# Streamer
A synced video/music room app based on Web-SyncPlay.

## Video Player

This app uses a native HTML5 `<video>` element for video playback with the following features:

### Supported Features
- **Native Browser Controls**: Play/pause, seek, volume, fullscreen
- **Picture-in-Picture (PiP)**: Native browser PiP support where available
- **HLS Streaming**: Automatic HLS support using hls.js for browsers without native support
- **Synchronized Playback**: Real-time sync across multiple clients in the same room
- **Error Handling**: Graceful fallback using yt-dlp for unsupported formats

### Supported Video Formats
- Direct video URLs (mp4, webm, ogg, etc.)
- HLS streams (.m3u8)
- Any format playable in modern browsers

### Note on YouTube Videos
For YouTube videos, the app uses a fallback API (yt-dlp) to extract direct video URLs since YouTube's iframe player cannot be used with native HTML5 `<video>` elements.

## Development

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

Lint code:
```bash
npm run lint
```
