# 白紙に戻さない移行手順

## 現在

- AMORÉTTO専用
- 共通パスワード
- post_historiesは単一店舗

## 次の段階

1. VercelでAMORÉTTO非公開実証
2. 1〜2週間、営業で使用
3. 何度も困った点だけ改善
4. migration_2_multi_tenant_bridge.sqlでbusiness_id追加
5. ENABLE_MULTI_TENANT_SCHEMA=true
6. 2店舗目の実証
7. Supabase Authとbusiness_members
8. RLSで店舗データを分離
9. 店舗設定をDBへ移す
10. AI社員会議室を追加

古い機能を捨てて作り直すのではなく、機能ごとに新しい基盤へ移します。
