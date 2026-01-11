import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import { createClient } from '../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'YouTube URLが必要です' },
        { status: 400 }
      );
    }

    if (!ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: '有効なYouTube URLを入力してください' },
        { status: 400 }
      );
    }

    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;
    
    const duration = formatDuration(parseInt(videoDetails.lengthSeconds));

    // Supabaseクライアントを作成して認証情報を取得
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: '認証エラーが発生しました' },
        { status: 401 }
      );
    }

    // 動画情報取得時にキューに追加（pending状態で）
    const { data: queueItem, error: queueError } = await supabase
      .from('download_logs')
      .insert({
        user_id: user.id,
        video_id: videoDetails.videoId,
        video_title: videoDetails.title,
        video_channel: videoDetails.author.name,
        video_duration: duration,
        video_thumbnail_url: videoDetails.thumbnails[0]?.url,
        download_format: 'mp4',
        download_status: 'pending'
      })
      .select()
      .single();

    if (queueError) {
      console.error('Failed to add to queue:', queueError);
      return NextResponse.json(
        { error: 'キューへの追加に失敗しました' },
        { status: 500 }
      );
    }

    // バックグラウンドで動画ダウンロードを開始
    downloadAndStoreVideo(queueItem.id, url, user.id).catch(console.error);

    return NextResponse.json({
      id: videoDetails.videoId,
      title: videoDetails.title,
      channel: videoDetails.author.name,
      duration: duration,
      thumbnail: videoDetails.thumbnails[0]?.url || '/next.svg',
      description: videoDetails.description,
      queueId: queueItem?.id || null,
    });
  } catch (error) {
    console.error('Video info error:', error);
    return NextResponse.json(
      { error: '動画情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

async function downloadAndStoreVideo(logId: string, videoUrl: string, userId: string) {
  const supabase = await createClient();
  const fileName = `${userId}/${logId}.mp4`;
  
  try {
    // ステータスを処理中に更新
    await supabase
      .from('download_logs')
      .update({ download_status: 'in_progress' })
      .eq('id', logId);

    // 最低画質のMP4フォーマットを取得
    const info = await ytdl.getInfo(videoUrl);
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
    const lowestQuality = formats.reduce((prev, current) => 
      (prev.height || 0) < (current.height || 0) ? prev : current
    );

    if (!lowestQuality) {
      throw new Error('利用可能なフォーマットが見つかりません');
    }

    // ストリーミング直接アップロード（メモリ効率的）
    const videoStream = ytdl(videoUrl, { format: lowestQuality });
    let totalSize = 0;
    
    // ファイルサイズを計算するためのストリーム監視
    videoStream.on('data', (chunk: Buffer) => {
      totalSize += chunk.length;
    });

    // Supabase Storageに直接ストリーミングアップロード
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, videoStream, {
        contentType: 'video/mp4',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`アップロードエラー: ${uploadError.message}`);
    }

    // データベースを更新
    await supabase
      .from('download_logs')
      .update({
        download_status: 'completed',
        file_size_bytes: totalSize,
        storage_path: fileName
      })
      .eq('id', logId);

  } catch (error) {
    console.error('Download error:', error);
    
    // 部分的にアップロードされたファイルをクリーンアップ
    try {
      await supabase.storage
        .from('videos')
        .remove([fileName]);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    
    // エラー時にステータスを失敗に更新（具体的なエラーメッセージ付き）
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    await supabase
      .from('download_logs')
      .update({ 
        download_status: 'failed',
        // エラーメッセージを記録する場合は新しいカラムが必要
      })
      .eq('id', logId);
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}