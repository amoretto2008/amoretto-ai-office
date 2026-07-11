# AMORÉTTO AI社員オフィス
## 第1弾：AI投稿室 MVP 1.1・最終形態準拠版

現在動いているAMORÉTTO実証版を壊さず、将来の「店舗ごとのAI社員オフィス」へ機能単位で移行できるよう、画面・AI処理・店舗設定・履歴保存を整理した版です。

> AIで時間を生み、その時間で食文化を豊かにする。

## 何が変わったか

- 1枚の巨大な画面コードを、機能ごとの部品へ分割
- 店舗設定を `lib/businesses` に集約
- AIプロンプトを機能別ファイルへ分割
- OpenAI JSON生成処理を共通化
- Supabase履歴処理をリポジトリへ集約
- 将来の `business_id` を安全に有効化できる移行スイッチを追加
- MEO評価の項目名を店舗共通の `brandScore` へ変更
- 写真評価が「写真メモによる試験版」であることを明確化
- 現在の機能・見た目・簡易ログインは維持

## 現在できること

- AI投稿文作成
- Google投稿、Instagram、ストーリー、常連様LINE
- 口コミ返信AI
- MEO文章チェック（AI参考評価）
- 写真メモからの使い方提案（試験版）
- 投稿履歴、投稿済み管理、削除
- 簡易ログイン／ログアウト
- スマホのホーム画面追加用設定

## 最初にすること

現在版を消さず、別フォルダーへ展開してください。

```text
amoretto-ai-office                 現在版
amoretto-ai-office-mvp-1.1         今回版
```

現在版の `.env.local` を今回版へコピーし、最後に次を追加します。

```env
ENABLE_MULTI_TENANT_SCHEMA=false
```

起動：

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

## 大切な判断

この版は「全機能を先に作った完成品」ではありません。
最終形へ無理なく移れる構造を持ちながら、AMORÉTTOで今日から使える範囲に絞ったMVPです。

今は `ENABLE_MULTI_TENANT_SCHEMA=false` のまま使います。
複数店舗化へ進む時だけ `supabase/migration_2_multi_tenant_bridge.sql` を実行します。

詳細は `docs/final-form-blueprint.md` と `docs/upgrade-path.md` をご覧ください。

この版は Next.js 16 の `proxy.ts` 構成に合わせています。
