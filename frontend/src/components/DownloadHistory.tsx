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
}

export default function DownloadHistory() {
  const router = useRouter();
  const [history, setHistory] = useState<DownloadLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/download-history');
      
      if (!response.ok) {
        throw new Error('履歴の取得に失敗しました');
      }

      const data = await response.json();
      setHistory(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (videoId: string) => {
    router.push(`/videos/${videoId}`);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: '待機中',
      completed: '完了',
      failed: '失敗',
      in_progress: '処理中',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          動画リスト
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            再試行
          </button>
        </div>
      ) : history.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          まだ動画が追加されていません<br />
          上のフォームからYouTube URLを追加してください
        </p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3">動画</th>
                <th scope="col" className="px-4 py-3">チャンネル</th>
                <th scope="col" className="px-4 py-3">時間</th>
                <th scope="col" className="px-4 py-3">ステータス</th>
                <th scope="col" className="px-4 py-3">追加日時</th>
              </tr>
            </thead>
            <tbody>
              {history.map((log) => (
                <tr 
                  key={log.id}
                  onClick={() => handleRowClick(log.id)}
                  className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <img
                        src={log.video_thumbnail_url || '/next.svg'}
                        alt={log.video_title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="max-w-xs truncate">
                        {log.video_title}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {log.video_channel}
                  </td>
                  <td className="px-4 py-3">
                    {log.video_duration}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.download_status === 'completed' ? 'bg-green-100 text-green-800' :
                      log.download_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      log.download_status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {getStatusText(log.download_status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(log.downloaded_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}