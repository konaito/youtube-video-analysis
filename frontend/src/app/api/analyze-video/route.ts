import { NextRequest, NextResponse } from 'next/server'
import { AnalysisResult } from '@/lib/types'
import { extractVideoId, isValidYouTubeUrl } from '@/lib/videoUtils'

/**
 * JSON Schema定義（Structured Outputs用）
 * AnalysisResult型に基づいたスキーマ
 */
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

/**
 * YouTube動画分析API Route
 * 
 * OpenRouter APIのStructured Outputs機能を使用してYouTube動画を分析します。
 * 
 * @see /docs/openrouter-video-analysis-implementation.md
 * @see /docs/openrouter-structured-outputs-implementation.md
 */
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
      
      // エラーメッセージをより分かりやすく
      let errorMessage = '動画の分析に失敗しました'
      if (errorData.error?.message) {
        errorMessage = errorData.error.message
      } else if (response.status === 401) {
        errorMessage = 'APIキーが無効です。設定を確認してください。'
      } else if (response.status === 429) {
        errorMessage = 'リクエストが多すぎます。しばらく待ってから再度お試しください。'
      } else if (response.status === 400) {
        errorMessage = 'リクエストが無効です。YouTube URLを確認してください。'
      } else if (response.status >= 500) {
        errorMessage = 'サーバーエラーが発生しました。しばらく待ってから再度お試しください。'
      }
      
      return NextResponse.json(
        {
          error: errorMessage,
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
    
    if (!content) {
      throw new Error('Empty response content')
    }
    
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
