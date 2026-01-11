'use client'

import { useState } from 'react'
import { GuidePoint } from '@/lib/types'

interface GuidePointsProps {
  guidePoints: GuidePoint[]
}

export default function GuidePoints({ guidePoints }: GuidePointsProps) {
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
