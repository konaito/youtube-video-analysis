import LoadingScreen from '@/components/LoadingScreen'

interface AnalyzePageProps {
  params: Promise<{
    videoId: string
  }>
}

export default async function AnalyzePage({ params }: AnalyzePageProps) {
  const { videoId } = await params
  return <LoadingScreen videoId={videoId} />
}
