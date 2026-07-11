create table if not exists post_histories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  situation text not null,
  purpose text not null,
  photo_memo text,

  google_post text not null,
  instagram_post text not null,
  instagram_story text not null,
  line_message text not null,

  strategy_note text,
  photo_advice text,
  hashtags text[],

  is_posted boolean not null default false,
  posted_at timestamptz
);

create index if not exists post_histories_created_at_idx
on post_histories (created_at desc);

create index if not exists post_histories_is_posted_idx
on post_histories (is_posted);
