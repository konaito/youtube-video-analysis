'use client'

import { TimelineCard as TimelineCardType } from '@/lib/types'
import { formatTime } from '@/lib/videoUtils'

interface TimelineCardProps {
  card: TimelineCardType
  isActive: boolean
  onClick: () => void
  cardRef?: (element: HTMLDivElement | null) => void
}

// カテゴリ別の色
const categoryColors: Record<string, string> = {
  導入: '#3b82f6',
  'ASMR・生活音': '#10b981',
  関係性: '#f59e0b',
  会話: '#8b5cf6',
  '儀式・定型': '#ec4899',
  場面転換: '#06b6d4',
  '趣味・共感': '#f97316',
  裏側: '#6366f1',
  'シズル感・肯定': '#ef4444',
  ハプニング: '#14b8a6',
  日常感: '#64748b',
  エンディング: '#1e293b',
}

export default function TimelineCard({ card, isActive, onClick, cardRef }: TimelineCardProps) {
  const categoryColor = categoryColors[card.analysis.category] || '#6b7280'

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`
        relative rounded-lg p-4 mb-3 cursor-pointer transition-all
        ${isActive
          ? 'bg-yellow-50 border-2 border-yellow-400 shadow-lg scale-[1.02]'
          : 'bg-white border border-gray-200 hover:border-gray-300'
        }
      `}
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
      </div>

      {/* 詳細 */}
      <div className="space-y-2 text-sm">
        {/* 画面上のテキスト */}
        {card.onScreenTexts.length > 0 && (
          <div>
            <span className="font-medium">📺 画面上のテキスト:</span>
            <ul className="list-disc list-inside ml-2 text-gray-600">
              {card.onScreenTexts.map((text, idx) => (
                <li key={idx}>
                  {text.time} &quot;{text.text}&quot;
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
          <span
            className="inline-block px-2 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
          >
            🏷️ {card.analysis.category}
          </span>
        </div>
      </div>
    </div>
  )
}
