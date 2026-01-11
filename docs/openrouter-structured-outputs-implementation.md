# OpenRouter Structured Outputs実装ガイド

## 概要

OpenRouterのStructured Outputs機能を使用することで、AIモデルのレスポンスをJSON Schemaに基づいて強制的に構造化できます。これにより、パースエラーを減らし、より確実に型安全なデータを取得できます。

## Structured Outputsの利点

1. **型安全性の向上**: レスポンスが常に指定したスキーマに従うため、パースエラーが発生しにくい
2. **一貫性の保証**: モデルが異なる形式で応答することを防ぐ
3. **開発効率の向上**: パース処理が簡素化され、コードがシンプルになる
4. **エラーの削減**: 不正なフィールドや欠落フィールドを防ぐ

## 対応モデル

Structured Outputsは以下のモデルでサポートされています：

- **Google Geminiモデル**（`google/gemini-3-pro-preview`を含む）
- OpenAIモデル（GPT-4o以降）
- Anthropicモデル（Sonnet 4.5、Opus 4.1）
- 多くのオープンソースモデル
- Fireworks提供のすべてのモデル

対応モデルの一覧は[OpenRouter Modelsページ](https://openrouter.ai/models?order=newest&supported_parameters=structured_outputs)で確認できます。

## 実装方法

### 基本的な使用方法

Structured Outputsを使用するには、リクエストに`response_format`パラメータを追加します：

```typescript
{
  "model": "google/gemini-3-pro-preview",
  "messages": [...],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "video_analysis",
      "strict": true,
      "schema": {
        // JSON Schema定義
      }
    }
  }
}
```

### AnalysisResult型に基づいたJSON Schema定義

現在の`AnalysisResult`型に基づいて、以下のようなJSON Schemaを定義できます：

```typescript
const analysisResultSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: '動画のタイトル',
    },
    timeline: {
      type: 'array',
      description: 'タイムライン形式のシーン分析',
      items: {
        type: 'object',
        properties: {
          startTime: {
            type: 'number',
            description: 'シーンの開始時間（秒）',
          },
          endTime: {
            type: 'number',
            description: 'シーンの終了時間（秒）',
          },
          scene: {
            type: 'string',
            description: 'シーン名（起床、家事など）',
          },
          icon: {
            type: 'string',
            description: 'シーンを表す絵文字アイコン',
          },
          onScreenTexts: {
            type: 'array',
            description: '画面上に表示されているテキスト',
            items: {
              type: 'object',
              properties: {
                time: {
                  type: 'string',
                  description: '時刻（00:00形式）',
                },
                text: {
                  type: 'string',
                  description: '画面上のテキスト内容',
                },
              },
              required: ['time', 'text'],
            },
          },
          analysis: {
            type: 'object',
            properties: {
              intent: {
                type: 'string',
                description: '撮影・演出のポイント（意図）',
              },
              category: {
                type: 'string',
                description: 'カテゴリ（導入、ASMR・生活音、関係性、会話、儀式・定型、場面転換、趣味・共感、裏側、日常感、シズル感・肯定、ハプニング、エンディングなど）',
              },
            },
            required: ['intent', 'category'],
          },
        },
        required: ['startTime', 'endTime', 'scene', 'icon', 'onScreenTexts', 'analysis'],
      },
    },
    guidePoints: {
      type: 'array',
      description: '動画の特徴的な撮影・編集テクニックの指南ポイント',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: '指南ポイントのタイトル',
          },
          icon: {
            type: 'string',
            description: 'ポイントを表す絵文字アイコン',
          },
          description: {
            type: 'string',
            description: 'ポイントの説明',
          },
          details: {
            type: 'string',
            description: '詳細な説明',
          },
          examples: {
            type: 'array',
            description: '具体例のリスト',
            items: {
              type: 'string',
            },
          },
        },
        required: ['title', 'icon', 'description', 'details', 'examples'],
      },
    },
  },
  required: ['title', 'timeline', 'guidePoints'],
  additionalProperties: false,
}
```

## 実装例：route.tsの更新

現在の`route.ts`をStructured Outputsを使用するように更新する例：

```typescript
// app/api/analyze-video/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AnalysisResult } from '@/lib/types'
import { extractVideoId, isValidYouTubeUrl } from '@/lib/videoUtils'

// JSON Schema定義
const analysisResultSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: '動画のタイトル',
    },
    timeline: {
      type: 'array',
      description: 'タイムライン形式のシーン分析',
      items: {
        type: 'object',
        properties: {
          startTime: {
            type: 'number',
            description: 'シーンの開始時間（秒）',
          },
          endTime: {
            type: 'number',
            description: 'シーンの終了時間（秒）',
          },
          scene: {
            type: 'string',
            description: 'シーン名（起床、家事など）',
          },
          icon: {
            type: 'string',
            description: 'シーンを表す絵文字アイコン',
          },
          onScreenTexts: {
            type: 'array',
            description: '画面上に表示されているテキスト',
            items: {
              type: 'object',
              properties: {
                time: {
                  type: 'string',
                  description: '時刻（00:00形式）',
                },
                text: {
                  type: 'string',
                  description: '画面上のテキスト内容',
                },
              },
              required: ['time', 'text'],
            },
          },
          analysis: {
            type: 'object',
            properties: {
              intent: {
                type: 'string',
                description: '撮影・演出のポイント（意図）',
              },
              category: {
                type: 'string',
                description: 'カテゴリ（導入、ASMR・生活音、関係性、会話、儀式・定型、場面転換、趣味・共感、裏側、日常感、シズル感・肯定、ハプニング、エンディングなど）',
              },
            },
            required: ['intent', 'category'],
          },
        },
        required: ['startTime', 'endTime', 'scene', 'icon', 'onScreenTexts', 'analysis'],
      },
    },
    guidePoints: {
      type: 'array',
      description: '動画の特徴的な撮影・編集テクニックの指南ポイント（3つ）',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: '指南ポイントのタイトル',
          },
          icon: {
            type: 'string',
            description: 'ポイントを表す絵文字アイコン',
          },
          description: {
            type: 'string',
            description: 'ポイントの説明',
          },
          details: {
            type: 'string',
            description: '詳細な説明',
          },
          examples: {
            type: 'array',
            description: '具体例のリスト',
            items: {
              type: 'string',
            },
          },
        },
        required: ['title', 'icon', 'description', 'details', 'examples'],
      },
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ['title', 'timeline', 'guidePoints'],
  additionalProperties: false,
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json()

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      )
    }

    // YouTube URLの検証
    if (!isValidYouTubeUrl(videoUrl)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    // APIキーの確認
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not set')
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      )
    }

    // 動画IDを抽出
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Failed to extract video ID from URL' },
        { status: 400 }
      )
    }

    // 分析プロンプト
    const analysisPrompt = `この動画を分析し、タイムライン形式で各シーンの撮影・演出のポイントを説明してください。

各シーンについて以下の情報を提供してください：
1. 時間範囲（開始秒数と終了秒数）
2. シーン名と主な行動
3. 画面上に表示されているテキスト（時刻、説明など）
4. 撮影・演出の意図やポイント
5. カテゴリ（導入、ASMR・生活音、関係性、会話、儀式・定型、場面転換、趣味・共感、裏側、日常感、シズル感・肯定、ハプニング、エンディングなど）

最後に、この動画の特徴的な撮影・編集テクニックを3つまとめてください。`

    // OpenRouter APIを呼び出し（Structured Outputsを使用）
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || '',
        'X-Title': 'YouTube Video Analysis',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt,
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
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'video_analysis',
            strict: true,
            schema: analysisResultSchema,
          },
        },
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenRouter API Error:', errorData)
      return NextResponse.json(
        {
          error: 'Failed to analyze video',
          details: errorData.error?.message || `HTTP ${response.status}`,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    const analysisResult = parseAnalysisResponse(data, videoId)

    return NextResponse.json({ result: analysisResult })
  } catch (error) {
    console.error('Error analyzing video:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * OpenRouter APIのレスポンスをAnalysisResult形式に変換する
 * Structured Outputsを使用しているため、パース処理が簡素化される
 */
function parseAnalysisResponse(apiResponse: any, videoId: string): AnalysisResult {
  try {
    // Structured Outputsを使用している場合、contentはJSON文字列
    const content = apiResponse.choices?.[0]?.message?.content || ''
    
    // JSON文字列をパース
    const parsed = JSON.parse(content)

    // タイムラインを変換（idを追加）
    const timeline = (parsed.timeline || []).map((item: any, index: number) => ({
      id: String(index + 1),
      startTime: item.startTime,
      endTime: item.endTime,
      scene: item.scene,
      icon: item.icon,
      onScreenTexts: item.onScreenTexts || [],
      analysis: {
        intent: item.analysis.intent,
        category: item.analysis.category,
      },
    }))

    // 指南ポイントを変換（idを追加）
    const guidePoints = (parsed.guidePoints || []).map((point: any, index: number) => ({
      id: index + 1,
      title: point.title,
      icon: point.icon,
      description: point.description,
      details: point.details,
      examples: point.examples || [],
    }))

    return {
      videoId,
      title: parsed.title || '動画分析結果',
      timeline,
      guidePoints,
    }
  } catch (error) {
    console.error('Error parsing analysis response:', error)
    // パースに失敗した場合のフォールバック
    return {
      videoId,
      title: '動画分析結果',
      timeline: [],
      guidePoints: [],
    }
  }
}
```

## 現在の実装との比較

### 現在の実装（プロンプトでJSON形式を要求）

**メリット:**
- すべてのモデルで動作する
- 実装が簡単

**デメリット:**
- JSONパースエラーが発生する可能性がある
- コードブロック内のJSONを抽出する必要がある
- スキーマ検証ができない
- フォールバック処理が必要

### Structured Outputsを使用した実装

**メリット:**
- 型安全なレスポンスが保証される
- パースエラーが大幅に減少
- コードがシンプルになる
- スキーマ検証が自動的に行われる
- 不正なフィールドを防げる

**デメリット:**
- 対応モデルが限られる（ただし、Google Gemini 3 Pro Previewは対応）
- スキーマ定義が必要

## ベストプラクティス

1. **strictモードを使用**: 常に`strict: true`を設定して、スキーマに厳密に従うようにする

2. **明確なdescriptionを追加**: スキーマの各プロパティに`description`を追加して、モデルが正しい値を生成できるようにする

3. **requiredフィールドを明確に**: 必須フィールドを`required`配列で明示する

4. **additionalPropertiesをfalseに**: 予期しないフィールドを防ぐため、`additionalProperties: false`を設定する

5. **エラーハンドリング**: Structured Outputsがサポートされていない場合のエラーハンドリングを実装する

6. **型定義との整合性**: TypeScriptの型定義とJSON Schemaを一致させる

## エラーハンドリング

Structured Outputsを使用する際に発生する可能性のあるエラー：

1. **モデルがStructured Outputsをサポートしていない**
   - エラーメッセージ: "Model does not support structured outputs"
   - 対処: 対応モデルを使用するか、フォールバック処理を実装する

2. **無効なスキーマ**
   - エラーメッセージ: "Invalid JSON Schema"
   - 対処: JSON Schemaの構文を確認する

3. **スキーマに従えないレスポンス**
   - `strict: true`の場合、モデルがスキーマに従えないとエラーになる可能性がある
   - 対処: スキーマを緩和するか、`strict: false`を試す（推奨されない）

## ストリーミングとの併用

Structured Outputsはストリーミングレスポンスでも使用できます。モデルは有効な部分的なJSONをストリーミングし、完了時にスキーマに一致する完全なレスポンスを形成します。

```typescript
{
  "stream": true,
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      // ... スキーマ定義
    }
  }
}
```

## Response Healingプラグイン

非ストリーミングリクエストでStructured Outputsを使用する場合、[Response Healing](/docs/guides/features/plugins/response-healing)プラグインを有効にすることで、不完全なJSONフォーマットのリスクを減らせます。

## 参考リンク

- [OpenRouter Structured Outputs公式ドキュメント](https://openrouter.ai/docs/guides/features/structured-outputs)
- [OpenRouter Modelsページ（Structured Outputs対応モデル）](https://openrouter.ai/models?order=newest&supported_parameters=structured_outputs)
- [Google Gemini Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [JSON Schema仕様](https://json-schema.org/)

## まとめ

Structured Outputsを使用することで、より確実で型安全な動画分析結果を取得できます。特に`google/gemini-3-pro-preview`のような対応モデルを使用する場合、この機能を活用することで、パース処理の複雑さを大幅に減らし、コードの保守性を向上させることができます。
