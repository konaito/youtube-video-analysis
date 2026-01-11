'use client'

import { useState } from 'react'
import { TimelineCard as TimelineCardType } from '@/lib/types'
import TimelineCard from './TimelineCard'

interface TimelineListProps {
  timeline: TimelineCardType[]
  activeCardId: string | null
  onCardClick: (card: TimelineCardType) => void
  setCardRef: (cardId: string, element: HTMLDivElement | null) => void
  autoScroll?: boolean
  onAutoScrollChange?: (enabled: boolean) => void
}

export default function TimelineList({
  timeline,
  activeCardId,
  onCardClick,
  setCardRef,
  autoScroll: externalAutoScroll,
  onAutoScrollChange,
}: TimelineListProps) {
  const [internalAutoScroll, setInternalAutoScroll] = useState(true)
  const autoScroll = externalAutoScroll !== undefined ? externalAutoScroll : internalAutoScroll

  const handleAutoScrollChange = (enabled: boolean) => {
    if (externalAutoScroll === undefined) {
      setInternalAutoScroll(enabled)
    }
    onAutoScrollChange?.(enabled)
  }

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h2 className="text-xl font-bold">分析タイムライン</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => handleAutoScrollChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">自動スクロール</span>
        </label>
      </div>

      {/* タイムラインリスト */}
      <div className="flex-1 overflow-y-auto pr-2">
        {timeline.map((card) => (
          <TimelineCard
            key={card.id}
            card={card}
            isActive={activeCardId === card.id}
            onClick={() => onCardClick(card)}
            cardRef={(el) => setCardRef(card.id, el)}
          />
        ))}
      </div>
    </div>
  )
}
