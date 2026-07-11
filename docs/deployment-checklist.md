# Vercel公開チェックリスト

## GitHubへ上げる前

- `.env.local` が `.gitignore` に入っている
- `node_modules` が除外されている
- `.next` が除外されている
- APIキーがコードへ直接書かれていない
- `npm run typecheck` 成功
- `npm run build` 成功

## Vercel環境変数

- OPENAI_API_KEY
- OPENAI_MODEL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- APP_PASSWORD
- APP_SESSION_SECRET

## 公開後

- ログイン画面が出る
- 誤ったパスワードで入れない
- ログアウトできる
- 投稿文生成が動く
- 履歴が保存される
- 口コミ返信が動く
- MEO文章チェックが動く
- 写真メモ確認が動く
- スマホのホーム画面へ追加できる

## 現段階の公開範囲

一般向けサービスとして公開せず、AMORÉTTO専用の非公開実証版として運用します。
URLとパスワードを不用意に共有しません。
