# 現在版からMVP 1.1へ

1. 現在版フォルダーは消さない
2. ZIPを別フォルダーへ展開
3. 現在版の `.env.local` をコピー
4. `.env.local` に `ENABLE_MULTI_TENANT_SCHEMA=false` を追加
5. `npm install`
6. `npm run typecheck`
7. `npm run build`
8. `npm run dev`
9. ログイン、投稿生成、履歴、口コミ返信、MEO、写真メモを確認

Supabaseの追加SQLは今は不要です。
複数店舗化を始める時だけ `supabase/migration_2_multi_tenant_bridge.sql` を実行します。
