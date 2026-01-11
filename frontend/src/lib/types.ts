// タイムラインカードの型定義
export interface TimelineCard {
  id: string
  startTime: number // 秒
  endTime: number
  scene: string // シーン名（起床、家事など）
  icon: string // 絵文字アイコン
  onScreenTexts: Array<{
    time: string // "00:00" 形式
    text: string
  }>
  analysis: {
    intent: string // 撮影・演出のポイント（意図）
    category: string // カテゴリ（導入、ASMR・生活音など）
  }
}

// 指南ポイントの型定義
export interface GuidePoint {
  id: number
  title: string
  icon: string
  description: string
  details: string
  examples: string[]
}

// 分析結果の型定義
export interface AnalysisResult {
  videoId: string
  title: string
  timeline: TimelineCard[]
  guidePoints: GuidePoint[]
}

// 動画分析データの型定義
export interface VideoAnalysis {
  videoId: string
  title: string
  timeline: TimelineCard[]
  guidePoints: GuidePoint[]
}

// 解析待機画面用のステップ
export interface AnalysisStep {
  id: string
  label: string
  status: 'pending' | 'processing' | 'completed'
}
