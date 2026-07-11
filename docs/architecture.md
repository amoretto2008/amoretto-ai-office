# 現在の設計と将来の設計

## 現在

```text
AMORÉTTO AI社員オフィス
└ 第1弾：AI投稿室
   ├ 投稿文AI
   ├ お客様返信AI
   ├ MEO集客AI
   ├ 写真メモ確認
   └ 投稿履歴
```

現在はAMORÉTTO専用の単一店舗実証版です。

## 今回整理した部分

```text
lib/app-config.ts          アプリ名・バージョン・理念
lib/businesses/            店舗情報・文体・MEO語句
lib/openai-client.ts       AIモデルとAPI接続
lib/ai-employees.ts        将来のAI社員定義
components/                再利用する画面部品
```

これにより、店舗情報やAIモデルを複数のAPIへ直接書き続ける状態を減らしています。

## 将来

```text
AI社員オフィス
├ 店舗設定
├ AI投稿室
├ 口コミ返信室
├ MEO確認室
├ 写真選定室
├ AI社員会議室
└ 活動履歴
```

## 複数店舗化の予定

現在はまだデータベースへ `business_id` を追加していません。
既存のAMORÉTTO実証版を壊さないためです。

実証後、次の順番で移行します。

1. businessesテーブル
2. usersとbusiness_members
3. post_historiesへbusiness_id追加
4. 店舗ごとの認証
5. Row Level Security
6. 店舗設定画面
7. 複数店舗ダッシュボード

全面作り直しではなく、動いている機能を順番に移します。
