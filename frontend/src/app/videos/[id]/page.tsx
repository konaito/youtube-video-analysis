'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DownloadLog {
  id: string;
  video_id: string;
  video_title: string;
  video_channel: string;
  video_duration: string;
  video_thumbnail_url: string;
  download_format: string;
  file_size_bytes: number;
  download_status: string;
  downloaded_at: string;
  storage_path?: string;
}

export default function VideoPage(props: PageProps<'/videos/[id]'>) {
  const router = useRouter();
  const [video, setVideo] = useState<DownloadLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializePage = async () => {
      const { id } = await props.params;
      fetchVideo(id);
    };
    initializePage();
  }, [props.params]);

  const fetchVideo = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/video/${id}`);
      
      if (!response.ok) {
        throw new Error('動画の取得に失敗しました');
      }

      const data = await response.json();
      setVideo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!video || !video.storage_path) {
      setError('動画ファイルが見つかりません');
      return;
    }

    setDownloading(true);
    setError('');

    try {
      // Supabase Storageからダウンロードリンクを取得
      const response = await fetch('/api/storage-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          storagePath: video.storage_path
        }),
      });

      if (!response.ok) {
        throw new Error('ダウンロードリンクの取得に失敗しました');
      }

      const { downloadUrl } = await response.json();
      
      // ダウンロードを実行
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = `${video.video_title}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ダウンロードに失敗しました');
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '未計算';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '待機中', color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: '完了', color: 'bg-green-100 text-green-800' },
      failed: { label: '失敗', color: 'bg-red-100 text-red-800' },
      in_progress: { label: '処理中', color: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              ← リストに戻る
            </button>
          </div>

          {video && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-video bg-black">
                <img
                  src={video.video_thumbnail_url || '/next.svg'}
                  alt={video.video_title}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {video.video_title}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <strong>チャンネル:</strong> {video.video_channel}
                  </div>
                  <div>
                    <strong>時間:</strong> {video.video_duration}
                  </div>
                  <div>
                    <strong>追加日時:</strong> {formatDate(video.downloaded_at)}
                  </div>
                  <div>
                    <strong>ファイルサイズ:</strong> {formatFileSize(video.file_size_bytes)}
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>ステータス:</strong> {getStatusBadge(video.download_status)}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="flex justify-center">
                  {video.download_status === 'completed' && video.storage_path ? (
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-8 rounded-md transition-colors"
                    >
                      {downloading ? 'ダウンロード中...' : 'MP4ダウンロード'}
                    </button>
                  ) : video.download_status === 'pending' ? (
                    <div className="w-full sm:w-auto bg-yellow-100 text-yellow-800 font-medium py-3 px-8 rounded-md text-center">
                      ダウンロード待機中...
                    </div>
                  ) : video.download_status === 'in_progress' ? (
                    <div className="w-full sm:w-auto bg-blue-100 text-blue-800 font-medium py-3 px-8 rounded-md text-center">
                      動画処理中...
                    </div>
                  ) : video.download_status === 'failed' ? (
                    <div className="w-full sm:w-auto bg-red-100 text-red-800 font-medium py-3 px-8 rounded-md text-center">
                      処理に失敗しました
                    </div>
                  ) : (
                    <div className="w-full sm:w-auto bg-gray-100 text-gray-800 font-medium py-3 px-8 rounded-md text-center">
                      ステータス不明
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline"
                  >
                    YouTubeで見る ↗
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}