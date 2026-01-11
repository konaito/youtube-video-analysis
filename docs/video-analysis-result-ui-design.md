# 動画分析結果表示UIデザイン案

## 概要

YouTube動画の分析結果（APIからの返答）を受講生に見せるためのUIデザイン案をまとめます。提供される分析データには、タイムライン形式の詳細な分析表と、撮影・編集の指南ポイントが含まれています。

## 分析データの構造

### 1. タイムライン分析表

各シーンごとに以下の情報が含まれます：
- **時間範囲**: 00:00-00:04 など
- **シーン・行動**: 起床、家事、料理など
- **画面上のテキスト**: 実際に動画に表示されているテキスト
- **撮影・演出のポイント（意図）**: そのシーンで意識すべきポイント

### 2. 指南ポイント

動画制作のための3つの重要なポイント：
1. 「時間」と「行動」をテキストで可視化する
2. 「固定カメラ」と「手持ちカメラ」を使い分ける
3. 「完璧」よりも「ハプニング」や「ノリ」を大事にする

## UIデザイン案

### デザイン1: 3カラムレイアウト（PC推奨）

動画プレイヤー、タイムライン、詳細分析を同時に表示するレイアウトです。

```
+-------------------------------------------------------------------------------------------+
| Header: [ロゴ] [別の動画を分析する]                                                       |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
| +----------------------+ +--------------------------+ +------------------------------+   |
| |                      | | **タイムライン**         | | **詳細分析**                 |   |
| |                      | | [ 自動スクロール ON/OFF ] | | [ フィルター: 全て ▼ ]      |   |
| |    YouTube           | +--------------------------+ +------------------------------+   |
| |   プレイヤー         | |                          | | **撮影・演出のポイント**     |   |
| |   (埋め込み)         | | [00:00-00:04] 🌟         | |                              |   |
| |                      | | 🛏️ 起床                 | | 💡 **意図:** リアルな寝起き  |   |
| |                      | | テキスト: "10:15 起床"   | |   を見せることで親近感を     |   |
| |                      | | [詳細を見る ▼]          | |   演出。「起きない」→「起こす」|   |
| |                      | +--------------------------+ |   という夫婦のじゃれあいで   |   |
| |                      | |                          | |   仲の良さを提示。          |   |
| |                      | | [00:05-00:10]            | |                              |   |
| |                      | | 🍚 家事（炊飯）          | | **画面上のテキスト:**        |   |
| |                      | | テキスト: "10:21 お米を  | | - 00:00 "23歳幼なじみ夫婦の  |   |
| |                      | | 炊く"                    | |   日曜日"                    |   |
| |                      | | [詳細を見る ▼]          | | - 00:00 "10:15 起床"         |   |
| |                      | +--------------------------+ |                              |   |
| |                      | |                          | | **カテゴリ:**                |   |
| |                      | | [00:11-00:20]            | | 🏷️ 導入                      |   |
| |                      | | 🧹 掃除                  | |                              |   |
| |                      | | テキスト: "10:55 お掃除" | +------------------------------+   |
| |                      | | [詳細を見る ▼]          |                                |   |
| |                      | |                          | | **3つの指南ポイント**        |   |
| |                      | | (スクロール可能)         | |                              |   |
| |                      | |                          | | 1️⃣ **時間と行動の可視化**   |   |
| |                      | |                          | | 画面中央や端に「時刻」と     |   |
| |                      | |                          | | 「何をしているか」のテキスト |   |
| |                      | |                          | | を配置...                    |   |
| |                      | |                          | |                              |   |
| |                      | |                          | | 2️⃣ **カメラの使い分け**     |   |
| |                      | |                          | | 固定カメラと手持ちカメラを   |   |
| |                      | |                          | | シーンごとに使い分ける...    |   |
| |                      | |                          | |                              |   |
| |                      | |                          | | 3️⃣ **ハプニングを大事に**   |   |
| |                      | |                          | | 「完璧」よりも「ノリ」や     |   |
| |                      | |                          | | 「ハプニング」を残す...      |   |
| |                      | |                          | |                              |   |
| +----------------------+ +--------------------------+ +------------------------------+   |
+-------------------------------------------------------------------------------------------+
```

**特徴:**
- 左: YouTubeプレイヤー（固定）
- 中央: タイムライン（スクロール可能、現在のシーンをハイライト）
- 右: 選択したシーンの詳細分析と指南ポイント（常に表示）

**インタラクション:**
- タイムラインのカードをクリック → 該当時間にシーク + 右側に詳細を表示
- 動画再生中 → 現在のシーンのカードをハイライト + 自動スクロール
- 右側の詳細分析は、選択されたシーンに応じて動的に更新

### デザイン2: 2カラムレイアウト（シンプル版）

タイムラインと詳細を統合した、よりシンプルなレイアウトです。

```
+-------------------------------------------------------------------------------------------+
| Header: [ロゴ] [別の動画を分析する]                                                       |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
| +----------------------+ +------------------------------------------------------------+   |
| |                      | | **分析タイムライン**                                        |   |
| |                      | | [ 自動スクロール ON/OFF ] [ フィルター: 全て ▼ ]          |   |
| |    YouTube           | +------------------------------------------------------------+   |
| |   プレイヤー         | |                                                            |   |
| |   (埋め込み)         | | ┌────────────────────────────────────────────────────┐   |
| |                      | | │ 🌟 [00:00-00:04] 🛏️ 起床                            │   |
| |                      | | │                                                      │   |
| |                      | | │ 📺 画面上のテキスト:                                 │   |
| |                      | | │   • 00:00 "23歳幼なじみ夫婦の日曜日"                │   |
| |                      | | │   • 00:00 "10:15 起床"                               │   |
| |                      | | │                                                      │   |
| |                      | | │ 💡 **撮影・演出のポイント（意図）:**                │   |
| |                      | | │   リアルな寝起きを見せることで親近感を演出。         │   |
| |                      | | │   「起きない」→「起こす」という夫婦のじゃれあいで  │   |
| |                      | | │   仲の良さを提示。                                    │   |
| |                      | | │                                                      │   |
| |                      | | │ 🏷️ カテゴリ: 導入                                    │   |
| |                      | | └────────────────────────────────────────────────────┘   |
| |                      | |                                                            |   |
| |                      | | ┌────────────────────────────────────────────────────┐   |
| |                      | | │ [00:05-00:10] 🍚 家事（炊飯）                      │   |
| |                      | | │                                                      │   |
| |                      | | │ 📺 画面上のテキスト:                                 │   |
| |                      | | │   • 10:21 "お米を炊く"                               │   |
| |                      | | │                                                      │   |
| |                      | | │ 💡 **撮影・演出のポイント（意図）:**                │   |
| |                      | | │   【ASMR・生活音】水の音や炊飯器のスイッチ音を      │   |
| |                      | | │   強調し、リズムを作る。手元のアップで作業の        │   |
| |                      | | │   臨場感を出す。                                      │   |
| |                      | | │                                                      │   |
| |                      | | │ 🏷️ カテゴリ: ASMR・生活音                            │   |
| |                      | | └────────────────────────────────────────────────────┘   |
| |                      | |                                                            |   |
| |                      | | (スクロール可能)                                         |   |
| |                      | |                                                            |   |
| |                      | | ┌────────────────────────────────────────────────────┐   |
| |                      | | │ **📚 このような動画を撮るための3つの指南**         │   |
| |                      | | │                                                            │   |
| |                      | | │ 1️⃣ **「時間」と「行動」をテキストで可視化する**    │   |
| |                      | | │    この動画の最大の特徴は、画面中央や端に必ず      │   |
| |                      | | │    「時刻」と「何をしているか」のテキストが        │   |
| |                      | | │    入っていることです。                             │   |
| |                      | | │                                                            │   |
| |                      | | │ 2️⃣ **「固定カメラ」と「手持ちカメラ」を使い分ける**│   |
| |                      | | │    固定（三脚など）: 掃除、食事、就寝など...        │   |
| |                      | | │    手持ち（自撮り・相手撮り）: 料理の手元...        │   |
| |                      | | │                                                            │   |
| |                      | | │ 3️⃣ **「完璧」よりも「ハプニング」や「ノリ」を     │   |
| |                      | | │    大事にする**                                       │   |
| |                      | | │    おしゃれな映像美よりも、「二人の関係性」が      │   |
| |                      | | │    コンテンツの核です。                               │   |
| |                      | | └────────────────────────────────────────────────────┘   |
| |                      | |                                                            |   |
| +----------------------+ +------------------------------------------------------------+   |
+-------------------------------------------------------------------------------------------+
```

**特徴:**
- 左: YouTubeプレイヤー
- 右: タイムラインカード（各カードに詳細情報を含む）+ 指南ポイント（下部に固定）

**インタラクション:**
- タイムラインカードをクリック → 該当時間にシーク
- 動画再生中 → 現在のシーンのカードをハイライト（背景色変更、枠線強調）
- 指南ポイントは常に下部に表示（スクロールしても見える位置）

### デザイン3: アコーディオン式タイムライン（モバイル最適化）

モバイルデバイス向けに最適化された、縦スクロール型のレイアウトです。

```
+----------------------------+
| Header: [ロゴ]             |
+----------------------------+
| [ YouTubeプレイヤー ]      |
| (上部に固定 sticky)        |
+----------------------------+
| **分析タイムライン** |
|                            |
| ▼ [00:00-00:04] 🌟 起床   |
| ┌────────────────────────┐ |
| │ 📺 テキスト:            │ |
| │   • "10:15 起床"        │ |
| │                         │ |
| │ 💡 撮影・演出のポイント:│ |
| │   リアルな寝起きを...   │ |
| │                         │ |
| │ 🏷️ カテゴリ: 導入      │ |
| └────────────────────────┘ |
|                            |
| ▶ [00:05-00:10] 家事      |
|                            |
| ▶ [00:11-00:20] 掃除      |
|                            |
| :                          |
| (以下スクロール)           |
+----------------------------+
| ┌────────────────────────┐ |
| │ **📚 3つの指南ポイント**│ |
| │                        │ |
| │ 1️⃣ 時間と行動の可視化  │ |
| │ 2️⃣ カメラの使い分け    │ |
| │ 3️⃣ ハプニングを大事に  │ |
| │                        │ |
| │ [詳細を見る ▼]        │ |
| └────────────────────────┘ |
+----------------------------+
```

**特徴:**
- YouTubeプレイヤーを上部に固定（`position: sticky`）
- タイムラインカードはアコーディオン形式（クリックで展開/折りたたみ）
- 現在再生中のシーンは自動的に展開
- 指南ポイントは下部に固定表示

## 実装の詳細

### タイムラインカードのコンポーネント構造

```typescript
interface TimelineCard {
  id: string
  startTime: number // 秒
  endTime: number
  scene: string // シーン名（起床、家事など）
  icon: string // 絵文字アイコン
  onScreenTexts: Array<{
    time: string // "00:00" 形式
    text: string
  }>
  analysis: {
    intent: string // 撮影・演出のポイント（意図）
    category: string // カテゴリ（導入、ASMR・生活音など）
  }
}

interface GuidePoint {
  id: number
  title: string
  description: string
  examples?: string[]
}
```

### カードの視覚的デザイン

#### アクティブ（現在再生中）のカード

```css
.active-card {
  background-color: #fef3c7; /* 薄い黄色 */
  border: 3px solid #fbbf24; /* 太い黄色の枠線 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: scale(1.02); /* わずかに拡大 */
  transition: all 0.3s ease;
}
```

#### 通常のカード

```css
.normal-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.normal-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
```

### カテゴリ別の色分け

各カテゴリに応じて、カードの左側に色付きのバーを表示：

```typescript
const categoryColors = {
  '導入': '#3b82f6', // 青
  'ASMR・生活音': '#10b981', // 緑
  '関係性': '#f59e0b', // オレンジ
  '会話': '#8b5cf6', // 紫
  '儀式・定型': '#ec4899', // ピンク
  '場面転換': '#06b6d4', // シアン
  '趣味・共感': '#f97316', // オレンジ
  '裏側': '#6366f1', // インディゴ
  'シズル感・肯定': '#ef4444', // 赤
  'ハプニング': '#14b8a6', // ティール
  '日常感': '#64748b', // スレート
  'エンディング': '#1e293b', // ダークスレート
}
```

### 指南ポイントの表示

3つの指南ポイントは、常に見える位置に配置し、展開/折りたたみ可能にします：

```typescript
interface GuidePointCard {
  id: number
  title: string
  icon: string
  description: string
  details: string
  examples: string[]
  isExpanded: boolean
}
```

## インタラクション設計

### 1. タイムラインカードのクリック

```typescript
const handleCardClick = (card: TimelineCard) => {
  // 動画を該当時間にシーク
  if (playerRef.current) {
    const internalPlayer = playerRef.current.getInternalPlayer()
    if (internalPlayer && typeof internalPlayer.seekTo === 'function') {
      internalPlayer.seekTo(card.startTime, true)
    }
  }
  
  // カードをハイライト
  setActiveCardId(card.id)
  
  // 3カラムレイアウトの場合、右側に詳細を表示
  if (layout === 'three-column') {
    setSelectedCard(card)
  }
  
  // モバイルの場合、カードを展開
  if (isMobile) {
    toggleCardExpansion(card.id)
  }
}
```

### 2. 動画再生中の自動ハイライト

```typescript
useEffect(() => {
  if (!playing) return
  
  const interval = setInterval(() => {
    const currentTime = getCurrentTime()
    const activeCard = timelineCards.find(
      card => currentTime >= card.startTime && currentTime < card.endTime
    )
    
    if (activeCard && activeCard.id !== activeCardId) {
      setActiveCardId(activeCard.id)
      
      // 自動スクロール
      if (autoScroll) {
        scrollToCard(activeCard.id)
      }
      
      // モバイルの場合、自動展開
      if (isMobile && !isCardExpanded(activeCard.id)) {
        expandCard(activeCard.id)
      }
    }
  }, 100) // 100msごとにチェック
  
  return () => clearInterval(interval)
}, [playing, autoScroll, activeCardId])
```

### 3. フィルター機能

カテゴリやキーワードでフィルタリング：

```typescript
const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
const [searchQuery, setSearchQuery] = useState('')

const filteredCards = useMemo(() => {
  return timelineCards.filter(card => {
    // カテゴリフィルター
    if (selectedCategory && card.analysis.category !== selectedCategory) {
      return false
    }
    
    // 検索クエリフィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        card.scene.toLowerCase().includes(query) ||
        card.analysis.intent.toLowerCase().includes(query) ||
        card.onScreenTexts.some(text => text.text.toLowerCase().includes(query))
      )
    }
    
    return true
  })
}, [timelineCards, selectedCategory, searchQuery])
```

## レスポンシブデザイン

### ブレークポイント

```typescript
const breakpoints = {
  mobile: '640px',   // スマホ
  tablet: '1024px', // タブレット
  desktop: '1280px', // PC
}
```

### レイアウトの切り替え

- **モバイル（< 640px）**: デザイン3（アコーディオン式）
- **タブレット（640px - 1024px）**: デザイン2（2カラム）
- **PC（> 1024px）**: デザイン1（3カラム）またはデザイン2（2カラム）

## 実装例（React/Next.js）

### タイムラインカードコンポーネント

```typescript
'use client'

import { useState } from 'react'

interface TimelineCardProps {
  card: TimelineCard
  isActive: boolean
  onClick: () => void
  isMobile?: boolean
}

export default function TimelineCard({
  card,
  isActive,
  onClick,
  isMobile = false,
}: TimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const categoryColor = categoryColors[card.analysis.category] || '#6b7280'
  
  return (
    <div
      className={`
        relative rounded-lg p-4 mb-3 cursor-pointer transition-all
        ${isActive 
          ? 'bg-yellow-50 border-2 border-yellow-400 shadow-lg scale-[1.02]' 
          : 'bg-white border border-gray-200 hover:border-gray-300'
        }
      `}
      onClick={onClick}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: categoryColor,
      }}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{card.icon}</span>
          <span className="font-semibold text-sm">
            {formatTime(card.startTime)} - {formatTime(card.endTime)} | {card.scene}
          </span>
          {isActive && <span className="text-yellow-500">🌟</span>}
        </div>
        {isMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="text-gray-400"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
      </div>
      
      {/* 詳細（常に表示 or モバイルで展開時のみ） */}
      {(isMobile ? isExpanded : true) && (
        <div className="space-y-2 text-sm">
          {/* 画面上のテキスト */}
          {card.onScreenTexts.length > 0 && (
            <div>
              <span className="font-medium">📺 画面上のテキスト:</span>
              <ul className="list-disc list-inside ml-2 text-gray-600">
                {card.onScreenTexts.map((text, idx) => (
                  <li key={idx}>
                    {text.time} "{text.text}"
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* 撮影・演出のポイント */}
          <div>
            <span className="font-medium">💡 撮影・演出のポイント（意図）:</span>
            <p className="text-gray-700 ml-2">{card.analysis.intent}</p>
          </div>
          
          {/* カテゴリ */}
          <div>
            <span className="inline-block px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}>
              🏷️ {card.analysis.category}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 指南ポイントコンポーネント

```typescript
'use client'

import { useState } from 'react'

interface GuidePoint {
  id: number
  title: string
  icon: string
  description: string
  details: string
  examples: string[]
}

const guidePoints: GuidePoint[] = [
  {
    id: 1,
    title: '「時間」と「行動」をテキストで可視化する',
    icon: '1️⃣',
    description: 'この動画の最大の特徴は、画面中央や端に必ず「時刻」と「何をしているか」のテキストが入っていることです。',
    details: '視聴者が「今は朝なんだな」「もう夜か」と時間の流れを直感的に理解でき、長尺の1日を短く感じさせます。',
    examples: [
      'フォントはシンプルで読みやすいものを選ぶ',
      '映像の邪魔にならない位置に配置する',
    ],
  },
  // ... 他のガイドポイント
]

export default function GuidePoints() {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-6">
      <h3 className="text-lg font-bold mb-4">📚 このような動画を撮るための3つの指南</h3>
      <div className="space-y-3">
        {guidePoints.map((point) => (
          <div
            key={point.id}
            className="bg-white rounded-lg p-4 border border-gray-200"
          >
            <button
              onClick={() => setExpandedId(expandedId === point.id ? null : point.id)}
              className="w-full text-left flex items-center justify-between"
            >
              <span className="font-semibold">
                {point.icon} {point.title}
              </span>
              <span className="text-gray-400">
                {expandedId === point.id ? '▼' : '▶'}
              </span>
            </button>
            {expandedId === point.id && (
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p>{point.description}</p>
                <p className="text-gray-600">{point.details}</p>
                {point.examples.length > 0 && (
                  <ul className="list-disc list-inside ml-2">
                    {point.examples.map((example, idx) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## パフォーマンス最適化

### 1. 仮想スクロール

タイムラインカードが多数ある場合、仮想スクロールを実装：

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: filteredCards.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 150, // カードの推定高さ
  overscan: 5, // 画面外にレンダリングするカード数
})
```

### 2. メモ化

カードコンポーネントをメモ化して、不要な再レンダリングを防ぐ：

```typescript
export default React.memo(TimelineCard, (prevProps, nextProps) => {
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.isActive === nextProps.isActive
  )
})
```

### 3. 遅延読み込み

指南ポイントは初期表示時には折りたたみ、必要になったら展開：

```typescript
const [shouldLoadGuidePoints, setShouldLoadGuidePoints] = useState(false)

useEffect(() => {
  // ユーザーがスクロールして下部に近づいたら読み込む
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setShouldLoadGuidePoints(true)
    }
  })
  
  const target = document.getElementById('guide-points-trigger')
  if (target) observer.observe(target)
  
  return () => observer.disconnect()
}, [])
```

## アクセシビリティ

### キーボード操作

- `Tab`: カード間を移動
- `Enter`/`Space`: カードをクリック（シーク）
- `Arrow Up/Down`: 前後のカードに移動

### ARIA属性

```typescript
<div
  role="button"
  tabIndex={0}
  aria-label={`${card.scene}シーン、${formatTime(card.startTime)}から`}
  aria-pressed={isActive}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick()
    }
  }}
>
  {/* カードの内容 */}
</div>
```

## まとめ

このUIデザインにより、受講生は以下のことが可能になります：

1. **動画を見ながら分析結果を確認**: 再生中のシーンに対応する分析をリアルタイムで確認
2. **詳細な情報へのアクセス**: 各シーンの撮影・演出のポイントを詳細に理解
3. **学習ポイントの把握**: 3つの指南ポイントを通じて、動画制作のコツを学ぶ
4. **効率的な学習**: フィルターや検索機能で、興味のあるシーンに素早くアクセス

この設計により、受講生は動画を見ながら、プロの視点での分析を効果的に学習できます。
