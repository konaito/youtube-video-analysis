'use client'

import { useState, useCallback, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import TimelineList from '@/components/TimelineList'
import GuidePoints from '@/components/GuidePoints'
import { useVideoSync } from '@/hooks/useVideoSync'
import { TimelineCard, AnalysisResult } from '@/lib/types'

interface ResultPageProps {
  params: Promise<{
    videoId: string
  }>
}

export default function ResultPage({ params }: ResultPageProps) {
  const { videoId } = use(params)
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(0)
  const [seekTime, setSeekTime] = useState<number | undefined>(undefined)
  const [autoScroll, setAutoScroll] = useState(true)
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // セッションストレージから分析結果を読み込む
  useEffect(() => {
    const storageKey = `analysis_result_${videoId}`
    const storedData = sessionStorage.getItem(storageKey)

    console.log('[ResultPage] Loading analysis data:', {
      videoId,
      storageKey,
      hasStoredData: !!storedData,
    })

    if (storedData) {
      try {
        const parsedData: AnalysisResult = JSON.parse(storedData)
        console.log('[ResultPage] Parsed analysis data:', {
          videoId: parsedData.videoId,
          title: parsedData.title,
          timelineLength: parsedData.timeline.length,
          guidePointsLength: parsedData.guidePoints.length,
          firstTimelineItem: parsedData.timeline[0],
        })
        
        // videoIdが一致することを確認
        if (parsedData.videoId === videoId) {
          setAnalysisData(parsedData)
          setError(null)
        } else {
          console.error('[ResultPage] VideoId mismatch:', {
            expected: videoId,
            actual: parsedData.videoId,
          })
          setError('動画IDが一致しません')
        }
      } catch (err) {
        console.error('Error parsing stored analysis data:', err)
        setError('分析データの読み込みに失敗しました')
      }
    } else {
      console.warn('[ResultPage] No stored data found for:', storageKey)
      setError('分析データが見つかりません。もう一度分析を実行してください。')
    }
    setLoading(false)
  }, [videoId])

  // 動画同期フック（データが読み込まれた場合のみ）
  const { activeCardId, setCardRef } = useVideoSync({
    timeline: analysisData?.timeline || [],
    currentTime,
    autoScroll,
  })

  // カードクリック時のシーク処理
  const handleCardClick = useCallback((card: TimelineCard) => {
    setSeekTime(card.startTime)
  }, [])

  // シーク完了後のリセット
  const handleSeekComplete = useCallback(() => {
    setSeekTime(undefined)
  }, [])

  // ローディング中またはエラー時の表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">TubeStudy AI</h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ホームに戻る
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  エラーが発生しました
                </h2>
                <p className="text-red-700 mb-4">{error || '分析データが見つかりません'}</p>
                <button
                  onClick={() => router.push(`/analyze/${videoId}`)}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  もう一度分析する
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">TubeStudy AI</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            別の動画を分析する
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 動画タイトル */}
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{analysisData.title}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 左側: YouTubeプレイヤー */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <VideoPlayer
              videoId={videoId}
              onTimeUpdate={setCurrentTime}
              onSeek={seekTime}
            />
            <div className="text-sm text-gray-600">
              現在の時間: {Math.floor(currentTime / 60)}:
              {Math.floor(currentTime % 60)
                .toString()
                .padStart(2, '0')}
            </div>
          </div>

          {/* 右側: タイムライン */}
          <div className="bg-white rounded-lg p-4 shadow-sm lg:max-h-[calc(100vh-8rem)] lg:flex lg:flex-col">
            <TimelineList
              timeline={analysisData.timeline}
              activeCardId={activeCardId}
              onCardClick={handleCardClick}
              setCardRef={setCardRef}
              autoScroll={autoScroll}
              onAutoScrollChange={setAutoScroll}
            />
          </div>
        </div>

        {/* 指南ポイント */}
        <div className="mt-6">
          <GuidePoints guidePoints={analysisData.guidePoints} />
        </div>
      </main>
    </div>
  )
}
