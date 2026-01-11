import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { storagePath } = await request.json();

    if (!storagePath || typeof storagePath !== 'string') {
      return NextResponse.json(
        { error: 'Storage pathが必要です' },
        { status: 400 }
      );
    }

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

    // ユーザーが自分のファイルにのみアクセスできるかチェック
    if (!storagePath.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // Supabase Storageからダウンロード用署名付きURLを生成（1時間有効）
    const { data, error } = await supabase.storage
      .from('videos')
      .createSignedUrl(storagePath, 3600, {
        download: true // ダウンロード強制フラグ
      });

    if (error) {
      console.error('Storage error:', error);
      return NextResponse.json(
        { error: 'ダウンロードリンクの生成に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      downloadUrl: data.signedUrl
    });
  } catch (error) {
    console.error('Storage download error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}