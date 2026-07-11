# 現在状況

## 製品名

AMORÉTTO AI社員オフィス
第1弾：AI投稿室 MVP 1.1・最終形態準拠版

## 現在の位置づけ

- AMORÉTTO専用の非公開実証版
- 現行Supabaseテーブルのまま利用可能
- 複数店舗化の接続点だけ先に整備
- 新機能を増やしすぎず、毎日使える範囲を維持

## 検証

- npm run typecheck：成功
- npm run build：成功
- Next.js 16のproxy構成へ移行済み

## 次の作業

1. 別フォルダーへ展開
2. .env.localをコピー
3. ENABLE_MULTI_TENANT_SCHEMA=falseを追加
4. ローカル動作確認
5. GitHub
6. Vercel非公開実証
7. スマホで1〜2週間使用
