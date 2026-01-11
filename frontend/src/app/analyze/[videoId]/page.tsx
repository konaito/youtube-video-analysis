import LoadingScreen from '@/components/LoadingScreen'
import { use } from 'react'

interface AnalyzePageProps {
  params: Promise<{
    videoId: string
  }>
}

export default function AnalyzePage({ params }: AnalyzePageProps) {
  const { videoId } = use(params)
  return <LoadingScreen videoId={videoId} />
}
