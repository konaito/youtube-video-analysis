'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { isValidYouTubeUrl, extractVideoId } from '@/lib/videoUtils'

export default function VideoInputForm() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!url.trim()) {
      setError('YouTube URLを入力してください')
      return
    }

    if (!isValidYouTubeUrl(url)) {
      setError('有効なYouTube URLを入力してください')
      return
    }

    const videoId = extractVideoId(url)
    if (videoId) {
      router.push(`/analyze/${videoId}`)
    } else {
      setError('動画IDの抽出に失敗しました')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          TubeStudy AI
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          プロの視点で、人気動画を丸裸に。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
              📺
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError(null)
              }}
              placeholder="YouTubeのURLをここに貼り付け..."
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            分析を開始する ▶
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          例: 23歳幼なじみ夫婦のルーティン動画を試す
        </p>
      </div>
    </div>
  )
}
