'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnalysisStep, AnalysisResult } from '@/lib/types'

interface LoadingScreenProps {
  videoId: string
  steps?: AnalysisStep[]
}

export default function LoadingScreen({ videoId, steps }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentSteps, setCurrentSteps] = useState<AnalysisStep[]>(
    steps || [
      { id: '1', label: 'シーンの切り替わりを検出中...', status: 'pending' },
      { id: '2', label: '画面内のテキストを読み取り中...', status: 'pending' },
      { id: '3', label: '演出意図をAIが推測中...', status: 'pending' },
    ]
  )
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true
    let progressInterval: NodeJS.Timeout | null = null

    const analyzeVideo = async () => {
      try {
        // YouTube URLを再構築
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

        // ステップ1: シーンの切り替わりを検出中
        setCurrentSteps((prev) =>
          prev.map((step) =>
            step.id === '1' ? { ...step, status: 'processing' as const } : step
          )
        )
        setProgress(10)

        // API呼び出し
        const response = await fetch('/api/analyze-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoUrl }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error || errorData.details || `HTTP ${response.status}`
          )
        }

        const data = await response.json()
        const analysisResult: AnalysisResult = data.result

        if (!isMounted) return

        // ステップ2: 画面内のテキストを読み取り中
        setCurrentSteps((prev) =>
          prev.map((step) =>
            step.id === '1'
              ? { ...step, status: 'completed' as const }
              : step.id === '2'
              ? { ...step, status: 'processing' as const }
              : step
          )
        )
        setProgress(60)

        // ステップ3: 演出意図をAIが推測中
        setCurrentSteps((prev) =>
          prev.map((step) =>
            step.id === '2'
              ? { ...step, status: 'completed' as const }
              : step.id === '3'
              ? { ...step, status: 'processing' as const }
              : step
          )
        )
        setProgress(80)

        // セッションストレージに保存
        const storageKey = `analysis_result_${videoId}`
        sessionStorage.setItem(storageKey, JSON.stringify(analysisResult))
        
        console.log('[LoadingScreen] Analysis completed and saved:', {
          videoId,
          storageKey,
          title: analysisResult.title,
          timelineLength: analysisResult.timeline.length,
          guidePointsLength: analysisResult.guidePoints.length,
        })

        // すべてのステップを完了
        setCurrentSteps((prev) =>
          prev.map((step) =>
            step.id === '3'
              ? { ...step, status: 'completed' as const }
              : step
          )
        )
        setProgress(100)

        // 結果画面へリダイレクト
        setTimeout(() => {
          if (isMounted) {
            router.push(`/result/${videoId}`)
          }
        }, 500)
      } catch (err) {
        if (!isMounted) return

        console.error('Error analyzing video:', err)
        setError(
          err instanceof Error
            ? err.message
            : '動画の分析に失敗しました。もう一度お試しください。'
        )
        setCurrentSteps((prev) =>
          prev.map((step) => ({
            ...step,
            status: step.status === 'processing' ? ('pending' as const) : step.status,
          }))
        )
        setProgress(0)
      }
    }

    // プログレスバーのアニメーション（視覚的フィードバック用）
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return prev // 90%以上はAPI完了を待つ
        }
        return prev + Math.random() * 5 // ランダムに進捗を更新
      })
    }, 500)

    analyzeVideo()

    return () => {
      isMounted = false
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [videoId, router])

  const defaultSteps: AnalysisStep[] = currentSteps

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">
          動画を分析しています...
        </h2>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-xl">❌</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 mb-1">
                  分析に失敗しました
                </p>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-3 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  ホームに戻る
                </button>
              </div>
            </div>
          </div>
        )}

        {/* プログレスバー */}
        {!error && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* 分析ステップ */}
        {!error && (
          <div className="space-y-4">
            {defaultSteps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  step.status === 'completed'
                    ? 'bg-green-50 text-green-700'
                    : step.status === 'processing'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                <span className="text-xl">
                  {step.status === 'completed'
                    ? '✅'
                    : step.status === 'processing'
                    ? '🔄'
                    : '⏳'}
                </span>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
