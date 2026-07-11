-- 将来の複数店舗化へ移る時だけ実行してください。
-- 現在のAMORÉTTO実証版では実行不要です。

create table if not exists businesses (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

insert into businesses (id, name)
values ('amoretto', 'AMORÉTTO')
on conflict (id) do nothing;

alter table post_histories
add column if not exists business_id text references businesses(id);

update post_histories
set business_id = 'amoretto'
where business_id is null;

alter table post_histories
alter column business_id set not null;

create index if not exists post_histories_business_created_idx
on post_histories (business_id, created_at desc);

-- 実行後、Vercelと.env.localの ENABLE_MULTI_TENANT_SCHEMA=true に変更します。
-- 本格SaaS化では、さらにSupabase Auth、business_members、RLSを追加します。
