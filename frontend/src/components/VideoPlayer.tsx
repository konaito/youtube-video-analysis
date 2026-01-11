'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  videoId: string
  onTimeUpdate?: (currentTime: number) => void
  onSeek?: (time: number) => void
}

export default function VideoPlayer({ videoId, onTimeUpdate, onSeek }: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)

  // 再生時間の更新（100msごと）
  useEffect(() => {
    if (!playing || !onTimeUpdate) return

    const interval = setInterval(() => {
      try {
        const internalPlayer = playerRef.current?.getInternalPlayer()
        if (internalPlayer) {
          // YouTube IFrame Player API
          const ytPlayer = internalPlayer as any
          if (ytPlayer.getCurrentTime && typeof ytPlayer.getCurrentTime === 'function') {
            const currentTime = ytPlayer.getCurrentTime()
            onTimeUpdate(currentTime)
          }
        }
      } catch (error) {
        // エラーを無視（プレイヤーがまだ準備できていない場合など）
      }
    }, 100)

    return () => clearInterval(interval)
  }, [playing, onTimeUpdate])

  // シーク機能
  const handleSeek = useCallback((time: number) => {
    if (playerRef.current) {
      try {
        const internalPlayer = playerRef.current.getInternalPlayer()
        if (internalPlayer) {
          const ytPlayer = internalPlayer as any
          if (ytPlayer.seekTo && typeof ytPlayer.seekTo === 'function') {
            ytPlayer.seekTo(time, true)
            onTimeUpdate?.(time)
          }
        }
      } catch (error) {
        // エラーを無視
      }
    }
  }, [onTimeUpdate])

  // onSeek propが変更されたときにシーク
  useEffect(() => {
    if (onSeek !== undefined && onSeek !== null) {
      handleSeek(onSeek)
    }
  }, [onSeek, handleSeek])

  const url = `https://www.youtube.com/watch?v=${videoId}`

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        controls
        width="100%"
        height="100%"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onDuration={(dur) => setDuration(dur)}
        config={{
          youtube: {
            playerVars: {
              controls: 1,
              modestbranding: 1,
            },
          },
        }}
      />
    </div>
  )
}
