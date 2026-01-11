# OpenRouter APIを使用したYouTube動画分析の実装ガイド

## 概要

OpenRouter APIのVideo Inputs機能を使用して、YouTube動画を分析する方法をまとめます。このガイドでは、Next.jsアプリケーションでの実装例を含めます。

## OpenRouter APIとは

OpenRouterは、複数のAIモデルプロバイダーへの統一されたAPIインターフェースを提供するサービスです。Video Inputs機能により、動画ファイルやYouTube URLをAIモデルに送信して分析できます。

### 主な特徴

- **複数のモデル対応**: Google Gemini、Claude、GPT-4など複数のモデルを利用可能
- **Video URL対応**: YouTube URLを直接送信可能（プロバイダーによる）
- **Base64エンコード対応**: ローカルファイルも送信可能
- **統一API**: 複数のプロバイダーに対して同じAPI形式でアクセス

## セットアップ

### 1. APIキーの取得

1. [OpenRouter](https://openrouter.ai/)にアカウントを作成
2. API Keysページで新しいAPIキーを生成
3. 環境変数に保存（`.env.local`）

```bash
OPENROUTER_API_KEY=your_api_key_here
```

### 2. 必要なパッケージのインストール

```bash
cd frontend
bun add @openrouter/sdk
# または
npm install @openrouter/sdk
```

## 実装方法

### 方法1: YouTube URLを使用（推奨）

YouTube動画のURLを直接OpenRouter APIに送信する方法です。Google Gemini（AI Studio）ではYouTubeリンクのみサポートされています。

#### API Routeの実装（Next.js）

```typescript
// app/api/analyze-video/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, prompt } = await request.json()

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      )
    }

    // YouTube URLの検証
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(videoUrl)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || '', // オプション
        'X-Title': 'YouTube Video Analysis', // オプション
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp', // または 'google/gemini-2.5-flash'
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt || 'この動画の構成を分析し、タイムライン形式で各シーンの撮影・演出のポイントを説明してください。',
              },
              {
                type: 'video_url',
                video_url: {
                  url: videoUrl,
                },
              },
            ],
          },
        ],
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenRouter API Error:', errorData)
      return NextResponse.json(
        { error: 'Failed to analyze video', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ result: data })
  } catch (error) {
    console.error('Error analyzing video:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
```

#### クライアント側の実装

```typescript
// components/VideoAnalyzer.tsx
'use client'

import { useState } from 'react'

interface AnalysisResult {
  result: {
    choices: Array<{
      message: {
        content: string
      }
    }>
  }
}

export default function VideoAnalyzer() {
  const [videoUrl, setVideoUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) {
      setError('YouTube URLを入力してください')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: videoUrl.trim(),
          prompt: prompt || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '動画の分析に失敗しました')
      }

      const analysisResult = data.result as AnalysisResult['result']
      setResult(analysisResult.choices[0]?.message?.content || '分析結果が取得できませんでした')
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">YouTube動画分析</h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium mb-2">
            YouTube URL
          </label>
          <input
            id="videoUrl"
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            分析プロンプト（オプション）
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="この動画の構成を分析し、タイムライン形式で各シーンの撮影・演出のポイントを説明してください。"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !videoUrl.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? '分析中...' : '分析を開始'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="font-bold mb-2">分析結果:</h2>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 方法2: Base64エンコードを使用

ローカルファイルやプライベートな動画を分析する場合に使用します。

#### Base64エンコード関数

```typescript
// lib/video-utils.ts
export async function encodeVideoToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 100 * 1024 * 1024 // 100MB
  const allowedTypes = ['video/mp4', 'video/mpeg', 'video/mov', 'video/webm']

  if (file.size > maxSize) {
    return { valid: false, error: 'ファイルサイズが大きすぎます（最大100MB）' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'サポートされていない動画形式です' }
  }

  return { valid: true }
}
```

#### Base64エンコードを使用したAPI Route

```typescript
// app/api/analyze-video-base64/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { videoDataUrl, prompt } = await request.json()

    if (!videoDataUrl) {
      return NextResponse.json(
        { error: 'Video data URL is required' },
        { status: 400 }
      )
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt || 'この動画の内容を分析してください。',
              },
              {
                type: 'video_url',
                video_url: {
                  url: videoDataUrl, // data:video/mp4;base64,...形式
                },
              },
            ],
          },
        ],
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: 'Failed to analyze video', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ result: data })
  } catch (error) {
    console.error('Error analyzing video:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## プロンプト設計のベストプラクティス

### 動画構成分析用プロンプト例

```typescript
const analysisPrompt = `
この動画を分析し、以下の形式でタイムラインを作成してください：

【動画構成の分析表（タイムライン）】
時間 | シーン・行動 | 画面上のテキスト | 撮影・演出のポイント（意図）

各シーンについて：
1. 時間範囲（00:00-00:04形式）
2. シーン名と主な行動
3. 画面上に表示されているテキスト（時刻、説明など）
4. 撮影・演出の意図やポイント

最後に、この動画の特徴的な撮影・編集テクニックを3つまとめてください。
`
```

### 詳細分析用プロンプト例

```typescript
const detailedAnalysisPrompt = `
この動画を詳細に分析してください：

1. **動画のテーマと目的**
2. **視聴者ターゲット**
3. **各シーンの構成分析**（タイムライン形式）
   - 時間範囲
   - シーン内容
   - 画面上のテキスト
   - 撮影・演出のポイント
4. **撮影テクニック**（カメラワーク、構図など）
5. **編集テクニック**（カット、テンポ、BGMなど）
6. **視聴者への訴求ポイント**
7. **改善提案**
`
```

## エラーハンドリング

### 一般的なエラーと対処法

```typescript
// lib/openrouter-client.ts
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'OpenRouterError'
  }
}

export async function analyzeVideoWithRetry(
  videoUrl: string,
  prompt: string,
  maxRetries = 3
): Promise<any> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'video_url', video_url: { url: videoUrl } },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // レート制限エラー
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : attempt * 1000
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }

        throw new OpenRouterError(
          errorData.error?.message || 'API request failed',
          response.status,
          errorData
        )
      }

      return await response.json()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      // 最後の試行でない場合、リトライ
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))
        continue
      }
    }
  }

  throw lastError || new Error('Failed to analyze video after retries')
}
```

## ベストプラクティス

### 1. モデルの選択

動画分析に適したモデルを選択：

- **Google Gemini 2.0 Flash Exp**: 高速でコスト効率が良い
- **Google Gemini 2.5 Flash**: より高精度な分析が必要な場合
- **GPT-4 Vision**: より詳細な分析が必要な場合（コストが高い）

### 2. プロンプトの最適化

- **具体的な指示**: 何を分析してほしいかを明確に指定
- **出力形式の指定**: タイムライン形式、JSON形式など、構造化された出力を要求
- **例の提供**: 期待する出力形式の例を示す

### 3. エラーハンドリング

- **レート制限**: 429エラー時のリトライロジックを実装
- **タイムアウト**: 長時間の処理に対するタイムアウト設定
- **ユーザーフィードバック**: エラー時に分かりやすいメッセージを表示

### 4. パフォーマンス最適化

- **ストリーミング**: 長い動画の分析にはストリーミングレスポンスを検討
- **キャッシング**: 同じ動画の分析結果をキャッシュ
- **非同期処理**: 長時間の処理はバックグラウンドジョブとして実行

### 5. セキュリティ

- **APIキーの保護**: 環境変数で管理し、クライアント側に露出しない
- **入力検証**: YouTube URLの形式を検証
- **レート制限**: サーバー側でレート制限を実装

## 実装例: 完全な動画分析コンポーネント

```typescript
// components/VideoAnalysisForm.tsx
'use client'

import { useState } from 'react'
import { analyzeVideo } from '@/lib/video-analysis'

interface AnalysisResult {
  timeline: Array<{
    timeRange: string
    scene: string
    onScreenText: string[]
    analysis: string
  }>
  guidePoints: string[]
}

export default function VideoAnalysisForm() {
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!videoUrl.trim()) {
      setError('YouTube URLを入力してください')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const analysisResult = await analyzeVideo(videoUrl)
      setResult(analysisResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium mb-2">
          YouTube URL
        </label>
        <input
          id="videoUrl"
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? '分析中...' : '分析を開始'}
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">分析結果</h2>
          
          <div>
            <h3 className="font-semibold mb-2">タイムライン</h3>
            <div className="space-y-2">
              {result.timeline.map((item, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="font-medium">{item.timeRange} - {item.scene}</div>
                  <div className="text-sm text-gray-600 mt-1">{item.analysis}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">指南ポイント</h3>
            <ul className="list-disc list-inside space-y-1">
              {result.guidePoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </form>
  )
}
```

## トラブルシューティング

### よくある問題と解決策

1. **"Video URL not supported"エラー**
   - Google Gemini（AI Studio）はYouTubeリンクのみサポート
   - 他のプロバイダーではBase64エンコードが必要な場合がある

2. **"File too large"エラー**
   - 動画を圧縮する
   - 解像度を下げる（720p推奨）
   - 動画を短くトリミングする

3. **"Rate limit exceeded"エラー**
   - リトライロジックを実装
   - リクエスト間隔を空ける
   - OpenRouterのプランをアップグレード

4. **分析結果が不正確**
   - プロンプトをより具体的にする
   - より高精度なモデルを使用
   - 動画の品質を確認

## 参考リンク

- [OpenRouter公式ドキュメント](https://openrouter.ai/docs)
- [OpenRouter Modelsページ](https://openrouter.ai/models)
- [Google Gemini API ドキュメント](https://ai.google.dev/docs)

## まとめ

OpenRouter APIのVideo Inputs機能を使用することで、YouTube動画の分析を簡単に実装できます。このガイドを参考に、動画分析機能をアプリケーションに組み込んでください。
