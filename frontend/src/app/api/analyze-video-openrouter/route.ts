import { NextRequest, NextResponse } from 'next/server'
import { AnalysisResult } from '@/lib/types'
import { extractVideoId, isValidYouTubeUrl } from '@/lib/videoUtils'

/**
 * JSON Schema定義（OpenRouter Structured Outputs用）
 * AnalysisResult型に基づいたスキーマ
 * 
 * 注意: OpenRouterのStructured Outputsでは`additionalProperties`は使用できないため削除
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
            description: 'シーンの開始時間（動画の再生時間、秒数）。動画の何秒目からこのシーンが始まるかを示す数値（例：5、10、120など）。⚠️ 動画内に表示されている時刻（"10:21"など）を秒数に変換した値ではありません。動画の再生時間（秒数）です。',
          },
          endTime: {
            type: 'number',
            description: 'シーンの終了時間（動画の再生時間、秒数）。動画の何秒目でこのシーンが終わるかを示す数値（例：10、15、125など）。⚠️ 動画内に表示されている時刻（"10:21"など）を秒数に変換した値ではありません。動画の再生時間（秒数）です。',
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
                  description: '動画内に表示されている時刻（"MM:SS"形式、例："10:21" = 10時21分という時刻）。⚠️ これは動画の再生時間（秒数）ではありません。動画内で表示されている時刻です。startTime/endTimeとは別物です。',
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
}

/**
 * YouTube動画分析API Route（OpenRouter使用）
 * 
 * OpenRouter APIのStructured Outputs機能を使用してYouTube動画を分析します。
 * 
 * @see /docs/openrouter-structured-outputs-implementation.md
 * @see /docs/openrouter-video-analysis-implementation.md
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

【重要：時間の設定方法 - 動画内の時刻と動画の再生時間を区別すること】
各シーンについて、以下の順序で情報を収集してください：

1. まず、画面上に表示されているテキスト（時刻、説明など）をすべて収集してください
   - timeフィールドは"MM:SS"形式の文字列で、動画内に表示されている時刻を表します（例："10:21" = 動画内で表示されている10時21分という時刻）
   - ⚠️ 重要：これは動画の再生時間（秒数）ではありません。動画内で表示されている時刻です
   - 各シーンで表示されているすべてのテキストを時系列順に収集してください

2. 次に、動画の再生時間（秒数）からstartTimeとendTimeを計算してください
   - ⚠️ 重要：startTimeとendTimeは動画の再生時間（秒数）であり、動画内に表示されている時刻（"10:21"など）とは全く別物です
   - startTime: このシーンが動画の何秒目から始まるか（動画の再生時間、秒数）
   - endTime: このシーンが動画の何秒目で終わるか（動画の再生時間、秒数）
   - 例：動画の最初から5秒目にシーンが始まり、10秒目に終わる場合、startTime = 5、endTime = 10
   - ⚠️ 絶対に動画内の時刻（"10:21"など）を秒数に変換してstartTime/endTimeに使わないでください
   - 動画内の時刻"10:21"は10時21分という時刻であり、621秒という意味ではありません

3. シーン名と主な行動を記述してください

4. 撮影・演出の意図やポイントを説明してください

5. カテゴリを選択してください（導入、ASMR・生活音、関係性、会話、儀式・定型、場面転換、趣味・共感、裏側、日常感、シズル感・肯定、ハプニング、エンディングなど）

【時間の区別の確認】
- onScreenTextsのtimeフィールド：動画内に表示されている時刻（"MM:SS"形式の文字列、例："10:21"）
- startTime/endTime：動画の再生時間（数値の秒数、例：5、10、120など）
- これらは全く別物です。動画内の時刻を秒数に変換してstartTime/endTimeに使うことは絶対に禁止です

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
      } else if (response.status === 403) {
        errorMessage = 'APIキーの権限が不足しています。設定を確認してください。'
      } else if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        if (retryAfter) {
          errorMessage = `リクエストが多すぎます。${retryAfter}秒後に再度お試しください。`
        } else {
          errorMessage = 'リクエストが多すぎます。しばらく待ってから再度お試しください。'
        }
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
 * 時間文字列（"MM:SS"形式）を秒数に変換する
 */
function timeStringToSeconds(timeStr: string): number {
  try {
    const parts = timeStr.split(':')
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10)
      const seconds = parseInt(parts[1], 10)
      return minutes * 60 + seconds
    }
    return 0
  } catch {
    return 0
  }
}

/**
 * OpenRouter APIのレスポンスをAnalysisResult形式に変換する
 * Structured Outputsを使用しているため、パース処理が簡素化される
 */
function parseAnalysisResponse(apiResponse: any, videoId: string): AnalysisResult {
  try {
    // OpenRouter APIのレスポンス形式
    // Structured Outputsを使用している場合、contentはJSON文字列
    const content = apiResponse.choices?.[0]?.message?.content || ''
    
    if (!content) {
      throw new Error('Empty response content')
    }
    
    // JSON文字列をパース
    const parsed = JSON.parse(content)

    // タイムラインを変換（idを追加）
    const timeline = (parsed.timeline || []).map((item: any, index: number) => {
      const onScreenTexts = item.onScreenTexts || []
      
      // ⚠️ 重要：startTimeとendTimeは動画の再生時間（秒数）であり、
      // onScreenTextsのtimeフィールド（動画内の時刻）とは全く別物です。
      // onScreenTextsの時間を秒数に変換してstartTime/endTimeに使うことは禁止されています。
      // AIが正しく動画の再生時間を返すことを期待し、そのまま使用します。
      
      return {
        id: String(index + 1),
        startTime: item.startTime,
        endTime: item.endTime,
        scene: item.scene,
        icon: item.icon,
        onScreenTexts: onScreenTexts,
        analysis: {
          intent: item.analysis.intent,
          category: item.analysis.category,
        },
      }
    })

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
