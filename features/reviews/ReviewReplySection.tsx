"use client";

import { useState } from "react";
import { DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import { fetchJson } from "@/lib/client/fetch-json";
import { ResultCard } from "@/components/ui/ResultCard";
import { ReviewReplyResult, ReviewTone } from "@/features/shared/types";

export function ReviewReplySection({ copyText }: { copyText: (label: string, text: string) => Promise<void> }) {
  const [reviewText, setReviewText] = useState("");
  const [goodPoint, setGoodPoint] = useState("");
  const [tone, setTone] = useState<ReviewTone>("standard");
  const [result, setResult] = useState<ReviewReplyResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!reviewText.trim()) return alert("口コミ本文を入力してください。");
    setLoading(true); setResult(null);
    try {
      setResult(await fetchJson<ReviewReplyResult>("/api/review-reply", {
        method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
        body: JSON.stringify({ reviewText, goodPoint, tone, businessId: DEFAULT_BUSINESS_ID }),
      }));
    } catch (error) { alert(error instanceof Error ? error.message : "口コミ返信の生成に失敗しました。"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <section id="review" className="scroll-mt-4 mt-6 rounded-3xl bg-white p-5 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm tracking-[0.18em] text-amoretto-gold">REVIEW REPLY</p><h2 className="mt-1 text-xl font-semibold">口コミ返信AI</h2></div>
          <span className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs text-sky-800">お客様返信AI</span>
        </div>
        <label className="mt-5 block"><span className="text-sm font-semibold">口コミ本文</span><textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 outline-none focus:border-amoretto-gold" placeholder="Google口コミの本文を貼り付けてください。" /></label>
        <label className="mt-5 block"><span className="text-sm font-semibold">褒めてくださった点・触れたい点</span><textarea value={goodPoint} onChange={(e) => setGoodPoint(e.target.value)} className="mt-2 min-h-20 w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 outline-none focus:border-amoretto-gold" /></label>
        <div className="mt-5"><p className="text-sm font-semibold">返信の温度感</p><div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">{[
          ["standard", "標準"], ["short", "短め"], ["very_polite", "より丁寧"],
        ].map(([value, label]) => <button key={value} onClick={() => setTone(value as ReviewTone)} className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${tone === value ? "border-amoretto-wine bg-amoretto-wine text-white" : "border-stone-300 bg-stone-50 text-amoretto-ink"}`}>{label}</button>)}</div></div>
        <button onClick={generate} disabled={loading} className="mt-5 w-full rounded-2xl bg-amoretto-wine px-5 py-4 font-semibold text-white shadow disabled:opacity-60">{loading ? "返信文を作成中です…" : "口コミ返信を作成する"}</button>
      </section>
      {result && <section className="mt-6 space-y-4">
        <ResultCard title="Google口コミ返信文" text={result.mainReply} onCopy={() => copyText("Google口コミ返信文", result.mainReply)} />
        <ResultCard title="短め返信" text={result.shortReply} onCopy={() => copyText("短め返信", result.shortReply)} />
        <ResultCard title="より丁寧な返信" text={result.politeReply} onCopy={() => copyText("より丁寧な返信", result.politeReply)} />
        <div className="rounded-3xl bg-white p-5 shadow"><h2 className="text-lg font-semibold">返信の狙い</h2><p className="mt-3 whitespace-pre-wrap leading-8">{result.strategyNote}</p><h2 className="mt-5 text-lg font-semibold">違和感チェック</h2><p className="mt-3 whitespace-pre-wrap leading-8">{result.cautionNote}</p></div>
      </section>}
    </>
  );
}
