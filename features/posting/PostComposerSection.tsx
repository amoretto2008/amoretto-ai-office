"use client";

import { useState } from "react";
import { DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import {
  GeneratedPosts,
  PostPurpose,
  purposeLabels,
} from "@/lib/types";
import { fetchJson } from "@/lib/client/fetch-json";
import { ResultCard } from "@/components/ui/ResultCard";

const purposes: PostPurpose[] = [
  "today_seats",
  "meo_boost",
  "anniversary",
  "lunch",
  "review_reply",
  "regular_customer",
];

type Props = {
  copyText: (label: string, text: string) => Promise<void>;
  onGooglePostGenerated: (text: string) => void;
  onHistoryCreated: () => void;
};

export function PostComposerSection({
  copyText,
  onGooglePostGenerated,
  onHistoryCreated,
}: Props) {
  const [situation, setSituation] = useState(
    "今日はディナーがゆっくりしています。2名席を案内できます。"
  );
  const [purpose, setPurpose] = useState<PostPurpose>("today_seats");
  const [photoMemo, setPhotoMemo] = useState(
    "ワイン棚と2名テーブルが写った落ち着いた店内写真"
  );
  const [result, setResult] = useState<GeneratedPosts | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setResult(null);
    try {
      const data = await fetchJson<GeneratedPosts>("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          situation,
          purpose,
          photoMemo,
          businessId: DEFAULT_BUSINESS_ID,
        }),
      });
      setResult(data);
      onGooglePostGenerated(data.googlePost);
      onHistoryCreated();
    } catch (error) {
      alert(error instanceof Error ? error.message : "生成に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section id="post" className="scroll-mt-4 rounded-3xl bg-white p-5 shadow">
        <div>
          <p className="text-sm tracking-[0.18em] text-amoretto-gold">POST</p>
          <h2 className="mt-1 text-xl font-semibold">AI投稿文作成</h2>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-semibold">今日の状況・お客様へ伝えたいこと</span>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            className="mt-2 min-h-28 w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 outline-none focus:border-amoretto-gold"
            placeholder="営業状況だけでなく、忙しくて言葉にできなかった感謝も自由に書いてください。"
          />
          <p className="mt-2 text-xs leading-6 text-stone-500">
            頭の中にある気持ちや、お客様へ届けたい言葉も入力できます。
          </p>
        </label>

        <div className="mt-5">
          <p className="text-sm font-semibold">目的</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {purposes.map((item) => (
              <button
                key={item}
                onClick={() => setPurpose(item)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  purpose === item
                    ? "border-amoretto-wine bg-amoretto-wine text-white"
                    : "border-stone-300 bg-stone-50 text-amoretto-ink"
                }`}
              >
                {purposeLabels[item]}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-semibold">写真メモ</span>
          <textarea
            value={photoMemo}
            onChange={(e) => setPhotoMemo(e.target.value)}
            className="mt-2 min-h-20 w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 outline-none focus:border-amoretto-gold"
          />
        </label>

        <button
          onClick={generate}
          disabled={loading}
          className="mt-5 w-full rounded-2xl bg-amoretto-navy px-5 py-4 font-semibold text-white shadow disabled:opacity-60"
        >
          {loading ? "作成中です…" : "AIで投稿文を作成する"}
        </button>
      </section>

      {result && (
        <section className="mt-6 space-y-4">
          <ResultCard title="Google投稿文" text={result.googlePost} onCopy={() => copyText("Google投稿文", result.googlePost)} />
          <ResultCard title="Instagram投稿文" text={result.instagramPost} onCopy={() => copyText("Instagram投稿文", result.instagramPost)} />
          <ResultCard title="Instagramストーリー文" text={result.instagramStory} onCopy={() => copyText("Instagramストーリー文", result.instagramStory)} />
          <ResultCard title="常連様LINE文" text={result.lineMessage} onCopy={() => copyText("常連様LINE文", result.lineMessage)} />
          <div className="rounded-3xl bg-white p-5 shadow">
            <h2 className="text-lg font-semibold">投稿の狙い</h2>
            <p className="mt-3 whitespace-pre-wrap leading-8">{result.strategyNote}</p>
            <h2 className="mt-5 text-lg font-semibold">写真の使い方</h2>
            <p className="mt-3 whitespace-pre-wrap leading-8">{result.photoAdvice}</p>
            <h2 className="mt-5 text-lg font-semibold">ハッシュタグ</h2>
            <p className="mt-3 leading-8">{result.hashtags.join(" ")}</p>
          </div>
        </section>
      )}
    </>
  );
}
