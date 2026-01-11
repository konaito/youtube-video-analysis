import { useState, useEffect, useRef } from 'react'
import { TimelineCard } from '@/lib/types'

interface UseVideoSyncOptions {
  timeline: TimelineCard[]
  currentTime: number
  autoScroll?: boolean
}

export function useVideoSync({ timeline, currentTime, autoScroll = true }: UseVideoSyncOptions) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const autoScrollRef = useRef(autoScroll)

  // autoScrollの最新値を保持
  useEffect(() => {
    autoScrollRef.current = autoScroll
  }, [autoScroll])

  // 現在の再生時間に基づいてアクティブなカードを特定
  useEffect(() => {
    const activeCard = timeline.find(
      (card) => currentTime >= card.startTime && currentTime < card.endTime
    )
    setActiveCardId(activeCard?.id || null)
  }, [currentTime, timeline])

  // アクティブなカードを自動スクロール
  useEffect(() => {
    if (activeCardId && autoScrollRef.current) {
      const cardElement = cardRefs.current.get(activeCardId)
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [activeCardId])

  // カードのrefを設定する関数
  const setCardRef = (cardId: string, element: HTMLDivElement | null) => {
    if (element) {
      cardRefs.current.set(cardId, element)
    } else {
      cardRefs.current.delete(cardId)
    }
  }

  return {
    activeCardId,
    setCardRef,
  }
}