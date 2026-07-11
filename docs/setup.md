# セットアップ手順

## 1. 現在版を残す

現在動いているフォルダーは削除しません。

新しいMVPを別のフォルダーへ展開します。

## 2. 環境変数

現在版の `.env.local` を新しいフォルダーへコピーします。

新規作成する場合は `.env.example` を参考にしてください。

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_PASSWORD=...
APP_SESSION_SECRET=...
```

## 3. インストール

```bash
npm install
```

## 4. 確認

```bash
npm run typecheck
npm run build
```

## 5. 起動

```bash
npm run dev
```

ブラウザで開きます。

```text
http://localhost:3000
```

## 6. 動作確認

1. ログイン
2. 投稿文生成
3. 投稿履歴保存
4. 口コミ返信
5. MEO文章チェック
6. 写真メモ確認
7. 投稿済み切り替え
8. 履歴削除
9. ログアウト
