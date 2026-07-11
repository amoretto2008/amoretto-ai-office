"use client";

import { useState } from "react";
import { DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import { AMORETTO_PROFILE } from "@/lib/businesses";
import { fetchJson } from "@/lib/client/fetch-json";
import { ResultCard } from "@/components/ui/ResultCard";
import { ScoreBox } from "@/components/ui/ScoreBox";
import { MeoCheckResult } from "@/features/shared/types";

export function MeoCheckSection({ suggestedText, copyText }: { suggestedText: string; copyText: (label: string, text: string) => Promise<void> }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<MeoCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    const target = text.trim() || suggestedText.trim();
    if (!target) return alert("MEOチェックしたい投稿文を入力してください。");
    setLoading(true); setResult(null);
    try {
      setResult(await fetchJson<MeoCheckResult>("/api/meo-check", {
        method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
        body: JSON.stringify({ text: target, purpose: "meo_boost", businessId: DEFAULT_BUSINESS_ID }),
      }));
    } catch (error) { alert(error instanceof Error ? error.message : "MEOチェックに失敗しました。"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <section id="meo" className="scroll-mt-4 mt-6 rounded-3xl bg-white p-5 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm tracking-[0.18em] text-amoretto-gold">MEO CHECK</p><h2 className="mt-1 text-xl font-semibold">MEO文章チェック・AI参考評価</h2></div><span className="rounded-full border border-amoretto-gold bg-amoretto-gold/20 px-3 py-1 text-xs text-amoretto-navy">MEO集客AI</span></div>
        <p className="mt-3 text-xs leading-6 text-stone-500">実際の検索順位ではなく、文章の自然さと店舗らしさをAIが参考評価します。</p>
        <label className="mt-5 block"><span className="text-sm font-semibold">チェックしたいGoogle投稿文</span><textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 outline-none focus:border-amoretto-gold" /></label>
        {suggestedText && <button onClick={() => setText(suggestedText)} className="mt-3 rounded-full border border-amoretto-gold px-4 py-2 text-xs text-amoretto-navy">生成したGoogle投稿文を入れる</button>}
        <button onClick={check} disabled={loading} className="mt-5 w-full rounded-2xl bg-amoretto-gold px-5 py-4 font-semibold text-amoretto-navy shadow disabled:opacity-60">{loading ? "MEOチェック中です…" : "MEO文章を確認する"}</button>
      </section>
      {result && <section className="mt-6 space-y-4"><div className="rounded-3xl bg-white p-5 shadow"><h2 className="text-lg font-semibold">MEOチェック結果</h2><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"><ScoreBox label={`${AMORETTO_PROFILE.name}らしさ`} value={`${result.brandScore}点`} /><ScoreBox label="MEO自然度" value={`${result.meoScore}点`} /><ScoreBox label="押し売り感" value={result.salesPressure} /><ScoreBox label="キーワード詰め込み" value={result.keywordStuffing} /></div><h3 className="mt-5 font-semibold">良い点</h3><ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-7">{result.goodPoints.map((x,i)=><li key={i}>{x}</li>)}</ul><h3 className="mt-5 font-semibold">改善点</h3><ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-7">{result.improvements.map((x,i)=><li key={i}>{x}</li>)}</ul><h3 className="mt-5 font-semibold">総評</h3><p className="mt-2 whitespace-pre-wrap leading-8">{result.summary}</p></div><ResultCard title="修正版Google投稿文" text={result.revisedPost} onCopy={() => copyText("修正版Google投稿文", result.revisedPost)} /></section>}
    </>
  );
}
