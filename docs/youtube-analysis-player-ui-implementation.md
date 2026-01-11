# YouTube分析学習プレイヤー UI実装ガイド

## 概要

YouTube動画のURLを入力し、受講生が動画の分析結果を直感的に学び取れるWebアプリのUI設計と実装方法をまとめます。

**フロー:** URL入力 → 解析待機 → 結果表示（メイン画面）

## UI設計

### 1. URL入力画面 (トップページ)

シンプルで直感的なデザインを採用し、ユーザーが迷わず操作できるようにします。

```
+-------------------------------------------------------+
|  [ ロゴ：TubeStudy AI ]                               |
|                                                       |
|          プロの視点で、人気動画を丸裸に。             |
|                                                       |
|  +-------------------------------------------------+  |
|  | 📺 YouTubeのURLをここに貼り付け...              |  |
|  +-------------------------------------------------+  |
|                                                       |
|             [ 分析を開始する ▶ ]                       |
|                                                       |
|  例: 23歳幼なじみ夫婦のルーティン動画を試す            |
+-------------------------------------------------------+
```

**ポイント:**
- 中央に大きな入力欄とボタンを配置
- 迷わせないUI設計
- 期待感を持たせるデザイン

### 2. 解析待機画面 (ローディング)

分析中の進行状況を可視化し、ユーザーのストレスを軽減します。

```
+-------------------------------------------------------+
|                                                       |
|          動画を分析しています... (45%)                |
|                                                       |
|  [=========>           ] プログレスバー                |
|                                                       |
|  ✅ シーンの切り替わりを検出中...                     |
|  ✅ 画面内のテキストを読み取り中...                   |
|  🔄 演出意図をAIが推測中...                           |
|                                                       |
+-------------------------------------------------------+
```

**ポイント:**
- 具体的な作業内容を表示
- プログレスバーで進捗を可視化
- 「しっかり分析している感」を演出

### 3. 結果表示画面 (メイン画面・PC推奨)

左側にYouTubeプレイヤー、右側に分析タイムラインを配置し、動画再生とタイムラインのハイライトが完全に同期する設計です。

**画面レイアウト:**

```
+-------------------------------------------------------+
| Header: [ロゴ] [別の動画を分析する]                   |
+-------------------------------------------------------+
| Main Area (左右分割)                                  |
|                                                       |
| +----------------------+ +--------------------------+ |
| |                      | | **分析タイムライン** | |
| |                      | | [ 自動スクロール ON/OFF ]  | |
| |    YouTube           | +--------------------------+ |
| |   プレイヤー         | | [カード：00:00 起床]  ⬆️ | | <- 過ぎたシーン
| |   (埋め込み)         | +--------------------------+ |
| |                      | |==========================| |
| |                      | | [カード：00:05 家事]  🌟 | | <- **現在再生中(ハイライト)**
| |                      | |==========================| |
| |                      | +--------------------------+ |
| +----------------------+ | [カード：00:11 掃除]  ⬇️ | | <- 次のシーン
|                        | +--------------------------+ |
|                        | | (スクロール可能領域)       | |
|                        | +--------------------------+ |
+-------------------------------------------------------+
| Bottom Area (まとめ)                                  |
| +---------------------------------------------------+ |
| | **学習のまとめ：この動画の3つの重要ポイント** | |
| | [⏰時間を可視化] [📷カメラ使い分け] [❤️ノリを重視]  | |
| +---------------------------------------------------+ |
+-------------------------------------------------------+
```

**タイムラインカードの詳細デザイン:**

```
+-------------------------------------------------------+
| **⏱️ 00:11 - 00:20 | 🧹 掃除** (クリックでシーク)  |
+-------------------------------------------------------+
| [サムネイル画像] | 📺 画面テキスト: 「10:55 お掃除」 |
|                  |                                   |
|                  | **【🎬 撮影・演出のポイント】** |
|                  | 💡 **意図:** ただの掃除にしない。   |
|                  |    「ノリ」で仲の良さを強調。     |
|                  | ❤️ **関係性:** お尻を叩き合う、   |
|                  |    コロコロで反撃するオチ。       |
+-------------------------------------------------------+
```

**ハイライト機能:**
- 現在再生中の時間帯のカードは、枠線を太くし、背景色を薄い黄色にするなどして目立たせます
- CSSクラスで動的にスタイルを適用

**同期スクロール:**
- 再生が進むにつれて、常に現在再生中のカードがリストの中央付近に来るように自動でスクロールします
- `scrollIntoView({ behavior: 'smooth', block: 'center' })`を使用

### 4. スマホでの表示 (レスポンシブ)

スマホでは画面を縦に使い、YouTubeプレイヤーを上部に固定し、その下でタイムラインをスクロールさせる形が最も見やすいでしょう。

```
+----------------------------+
| Header: [ロゴ]             |
+----------------------------+
| [ YouTubeプレイヤー ]      |
| (上部に固定 sticky)        |
+----------------------------+
| **分析タイムライン** |
|                            |
| [カード: 00:00 起床]       |
| [カード: 00:05 家事] 🌟   | <- 再生中ハイライト
| [カード: 00:11 掃除]       |
| :                          |
| (以下スクロール)           |
+----------------------------+
| **まとめポイント** |
+----------------------------+
```

## 実装方法

### 方法1: ReactPlayerを使用（推奨）

ReactPlayerは、YouTubeを含む複数の動画プラットフォームをサポートするReactコンポーネントです。実装が簡単で、TypeScriptの型定義も充実しています。

#### インストール

```bash
bun add react-player
```

#### 基本的な実装例

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player'

interface TimelineCard {
  id: string
  startTime: number // 秒
  endTime: number
  title: string
  thumbnail?: string
  analysis: {
    intent: string
    relationship?: string
  }
}

export default function VideoAnalysisPlayer() {
  const playerRef = useRef<ReactPlayer>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // タイムラインカードのデータ（例）
  const timelineCards: TimelineCard[] = [
    {
      id: '1',
      startTime: 0,
      endTime: 5,
      title: '起床',
      analysis: {
        intent: '朝のルーティンを可視化',
      },
    },
    {
      id: '2',
      startTime: 5,
      endTime: 11,
      title: '家事',
      analysis: {
        intent: 'ノリで仲の良さを強調',
        relationship: 'お尻を叩き合う、コロコロで反撃するオチ',
      },
    },
    // ... 他のカード
  ]

  // 現在の再生時間に基づいてアクティブなカードを特定
  useEffect(() => {
    const activeCard = timelineCards.find(
      (card) => currentTime >= card.startTime && currentTime < card.endTime
    )
    setActiveCardId(activeCard?.id || null)
  }, [currentTime, timelineCards])

  // アクティブなカードを自動スクロール
  useEffect(() => {
    if (activeCardId && autoScroll) {
      const cardElement = document.getElementById(`timeline-card-${activeCardId}`)
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [activeCardId, autoScroll])

  // 再生時間の更新（100msごと）
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playing) {
        const internalPlayer = playerRef.current.getInternalPlayer()
        if (internalPlayer && typeof internalPlayer.getCurrentTime === 'function') {
          setCurrentTime(internalPlayer.getCurrentTime())
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [playing])

  const handleSeek = (startTime: number) => {
    if (playerRef.current) {
      const internalPlayer = playerRef.current.getInternalPlayer()
      if (internalPlayer && typeof internalPlayer.seekTo === 'function') {
        internalPlayer.seekTo(startTime, true)
        setCurrentTime(startTime)
      }
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4">
      {/* YouTubeプレイヤー */}
      <div className="flex-1">
        <ReactPlayer
          ref={playerRef}
          url="https://www.youtube.com/watch?v=VIDEO_ID"
          playing={playing}
          controls
          width="100%"
          height="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onDuration={(duration) => setDuration(duration)}
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

      {/* タイムライン */}
      <div className="flex-1 overflow-y-auto max-h-[600px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">分析タイムライン</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            <span>自動スクロール</span>
          </label>
        </div>

        {timelineCards.map((card) => {
          const isActive = activeCardId === card.id
          return (
            <div
              key={card.id}
              id={`timeline-card-${card.id}`}
              className={`mb-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isActive
                  ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSeek(card.startTime)}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">
                  ⏱️ {formatTime(card.startTime)} - {formatTime(card.endTime)} | {card.title}
                </span>
                {isActive && <span className="text-yellow-500">🌟</span>}
              </div>
              <div className="text-sm text-gray-600">
                <p>💡 <strong>意図:</strong> {card.analysis.intent}</p>
                {card.analysis.relationship && (
                  <p>❤️ <strong>関係性:</strong> {card.analysis.relationship}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
```

### 方法2: YouTube IFrame Player APIを直接使用

より細かい制御が必要な場合は、YouTube IFrame Player APIを直接使用することもできます。

#### 必要なスクリプトの読み込み

`layout.tsx`または`_document.tsx`に以下を追加：

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script src="https://www.youtube.com/iframe_api" async />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

#### TypeScript型定義の追加

```typescript
// types/youtube.d.ts
declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: () => void
  }
}

export interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => YT.PlayerState
  destroy: () => void
}

export {}
```

#### 実装例

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'

export default function YouTubePlayer() {
  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    // YouTube IFrame APIの読み込み待機
    if (window.YT && window.YT.Player) {
      initializePlayer()
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [])

  const initializePlayer = () => {
    if (!containerRef.current) return

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: 'VIDEO_ID',
      playerVars: {
        controls: 1,
        modestbranding: 1,
      },
      events: {
        onReady: (event: YT.PlayerEvent) => {
          console.log('Player ready')
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          if (event.data === YT.PlayerState.PLAYING) {
            startTimeTracking()
          } else {
            stopTimeTracking()
          }
        },
      },
    })
  }

  const startTimeTracking = () => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime()
        setCurrentTime(time)
      }
    }, 100)

    // クリーンアップ用に保存
    ;(window as any).timeTrackingInterval = interval
  }

  const stopTimeTracking = () => {
    if ((window as any).timeTrackingInterval) {
      clearInterval((window as any).timeTrackingInterval)
    }
  }

  const handleSeek = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true)
      setCurrentTime(seconds)
    }
  }

  return (
    <div>
      <div ref={containerRef} className="w-full aspect-video" />
      <p>現在の時間: {currentTime.toFixed(2)}秒</p>
    </div>
  )
}
```

## 実装のポイント

### 1. 再生時間の取得

- **ReactPlayerの場合:** `getInternalPlayer()`で内部プレイヤーにアクセスし、`getCurrentTime()`を呼び出す
- **YouTube IFrame APIの場合:** `player.getCurrentTime()`を直接呼び出す
- 更新頻度は100ms程度が適切（パフォーマンスと精度のバランス）

### 2. タイムラインカードのハイライト

- 現在の再生時間がカードの`startTime`と`endTime`の範囲内にあるかチェック
- アクティブなカードにCSSクラスを動的に適用
- Tailwind CSSの条件付きクラスを使用: `isActive ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'`

### 3. 自動スクロール

- `scrollIntoView({ behavior: 'smooth', block: 'center' })`を使用
- ユーザーが手動でスクロールしている場合は無効化するオプションを提供
- `autoScroll`フラグで制御

### 4. シーク機能

- カードをクリックしたときに`seekTo()`を呼び出して該当時間に移動
- `allowSeekAhead: true`を指定して、まだ読み込まれていない部分にもシーク可能にする

### 5. レスポンシブデザイン

- PC: 左右分割レイアウト（`flex-row`）
- スマホ: 縦並びレイアウト（`flex-col`）
- YouTubeプレイヤーは`aspect-video`クラスで16:9のアスペクト比を維持
- タイムラインは`overflow-y-auto`でスクロール可能に

### 6. パフォーマンス最適化

- `useEffect`の依存配列を適切に設定して不要な再レンダリングを防ぐ
- タイムラインカードのメモ化（`React.memo`）を検討
- 再生時間の更新は再生中のみ実行

## 参考リンク

- [ReactPlayer公式ドキュメント](https://github.com/cookpete/react-player)
- [YouTube IFrame Player API リファレンス](https://developers.google.com/youtube/iframe_api_reference)
- [Next.js App Router ドキュメント](https://nextjs.org/docs/app)

## 注意事項

1. **CORS制限:** YouTube IFrame APIは、同じオリジンからのみアクセス可能です
2. **APIキー:** YouTube Data APIを使用する場合は、APIキーの取得が必要です（動画情報の取得など）
3. **動画IDの抽出:** URLから動画IDを抽出する処理が必要です（例: `https://www.youtube.com/watch?v=VIDEO_ID`）
4. **モバイル対応:** iOS Safariでは自動再生が制限される場合があります
