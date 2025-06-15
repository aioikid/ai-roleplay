# AIロープレSaaS

営業ロープレーニング用のAIアプリケーションです。

## 機能

- 🎤 音声録音・認識（OpenAI Whisper）
- 🤖 AI会話（OpenAI GPT-4o）
- 🔊 音声合成（OpenAI TTS）
- 📞 Twilio音声通話機能

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
OPENAI_API_KEY=your_openai_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_API_KEY_SID=your_twilio_api_key_sid_here
TWILIO_API_KEY_SECRET=your_twilio_api_key_secret_here
TWIML_APP_SID=your_twiml_app_sid_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

## Netlifyデプロイ手順

### 1. GitHubリポジトリの作成

プロジェクトをGitHubにプッシュします。

### 2. Netlifyでサイトを作成

1. [Netlify](https://netlify.com)にログイン
2. "New site from Git"をクリック
3. GitHubリポジトリを選択
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

### 3. 環境変数の設定

Netlifyダッシュボードの Site settings > Environment variables で以下を設定：

- `OPENAI_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_API_KEY_SID`
- `TWILIO_API_KEY_SECRET`
- `TWIML_APP_SID`

### 4. デプロイ

設定完了後、自動的にデプロイが開始されます。

## API エンドポイント

- `/.netlify/functions/token` - Twilio認証トークン取得
- `/.netlify/functions/chat` - AI会話処理
- `/.netlify/functions/stt` - 音声認識
- `/.netlify/functions/tts` - 音声合成

## 技術スタック

- **フロントエンド**: Next.js, React, TypeScript
- **バックエンド**: Netlify Functions
- **AI**: OpenAI GPT-4o, Whisper, TTS
- **音声通話**: Twilio Voice SDK
- **デプロイ**: Netlify

## 注意事項

- Netlify Functionsは実行時間制限があります（10秒）
- 大きなファイルのアップロードには制限があります
- 環境変数は必ずNetlifyダッシュボードで設定してください
