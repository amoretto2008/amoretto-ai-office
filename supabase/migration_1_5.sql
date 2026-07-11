alter table post_histories
add column if not exists is_posted boolean not null default false;

alter table post_histories
add column if not exists posted_at timestamptz;

create index if not exists post_histories_is_posted_idx
on post_histories (is_posted);
