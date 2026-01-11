# YouTube ダウンローダー

Next.jsとBunを使用したYouTube動画ダウンロードアプリケーション

## 技術スタック

- **Next.js 15.5.0** (App Router)
- **React 19.1.0**
- **TypeScript**
- **Tailwind CSS**
- **Bun** (パッケージマネージャー & ランタイム)

## セットアップ

1. 依存関係のインストール:
```bash
bun install
```

2. 環境変数の設定:
```bash
cp .env.example .env.local
```

3. `.env.local`にYouTube API キーを設定:
```
YOUTUBE_API_KEY=your_actual_api_key_here
```

## 必要な外部ツール

このアプリケーションは以下の外部ツールに依存しています：

- **yt-dlp**: YouTube動画のダウンロードに使用
  ```bash
  # macOS
  brew install yt-dlp
  
  # Ubuntu/Debian
  sudo apt install yt-dlp
  
  # または pip で
  pip install yt-dlp
  ```

## YouTube API キーの取得

1. [Google Cloud Console](https://console.developers.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. YouTube Data API v3を有効化
4. 認証情報を作成してAPIキーを取得
5. `.env.local`にAPIキーを設定

## 開発サーバーの起動

```bash
bun run dev
```

## ビルド

```bash
bun run build
```

## 機能

- YouTube URLから動画情報を取得
- 動画のサムネイル、タイトル、チャンネル名、再生時間を表示
- MP4（動画）またはMP3（音声のみ）形式でダウンロード
- レスポンシブデザイン（モバイル対応）
- ダークモード対応

## API エンドポイント

- `POST /api/video-info` - YouTube動画の情報を取得
- `POST /api/download` - 動画をダウンロード

## 注意事項

- YouTube利用規約を遵守してご利用ください
- 著作権で保護されたコンテンツのダウンロードは避けてください
- 個人使用の範囲でのご利用を推奨します