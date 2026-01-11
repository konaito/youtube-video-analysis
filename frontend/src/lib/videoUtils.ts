/**
 * YouTube URLから動画IDを抽出する
 * @param url YouTube URL
 * @returns 動画ID、無効な場合はnull
 */
export function extractVideoId(url: string): string | null {
  if (!url) return null

  // youtube.com/shorts/...形式（YouTube Shorts）
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^&\n?#]+)/)
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1]
  }

  // youtube.com/watch?v=...形式
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1]
  }

  // youtu.be/...形式
  const shortMatch = url.match(/youtu\.be\/([^&\n?#]+)/)
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1]
  }

  return null
}

/**
 * YouTube URLが有効かどうかを検証する
 * @param url YouTube URL
 * @returns 有効な場合true
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null
}

/**
 * 秒数をMM:SS形式の文字列に変換する
 * @param seconds 秒数
 * @returns MM:SS形式の文字列
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * MM:SS形式の文字列を秒数に変換する
 * @param timeString MM:SS形式の文字列
 * @returns 秒数
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':')
  if (parts.length !== 2) return 0
  const mins = parseInt(parts[0], 10) || 0
  const secs = parseInt(parts[1], 10) || 0
  return mins * 60 + secs
}
