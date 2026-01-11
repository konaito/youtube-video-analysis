import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証エラーが発生しました' },
        { status: 401 }
      );
    }

    // URLパラメータから制限数を取得（デフォルトは50）
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: downloadLogs, error } = await supabase
      .from('download_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('downloaded_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch download history:', error);
      return NextResponse.json(
        { error: '履歴の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: downloadLogs });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '内部エラーが発生しました' },
      { status: 500 }
    );
  }
}