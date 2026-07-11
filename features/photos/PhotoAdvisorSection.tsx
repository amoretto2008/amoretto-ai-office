"use client";

import { useState } from "react";
import { DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import { fetchJson } from "@/lib/client/fetch-json";
import { ResultCard } from "@/components/ui/ResultCard";
import { ScoreBox } from "@/components/ui/ScoreBox";
import { PhotoPurpose, PhotoSelectResult } from "@/features/shared/types";

export function PhotoAdvisorSection({ copyText }: { copyText: (label: string, text: string) => Promise<void> }) {
  const [memo, setMemo] = useState("ワイン棚と2名テーブルが写った落ち着いた店内写真");
  const [purpose, setPurpose] = useState<PhotoPurpose>("google_post");
  const [result, setResult] = useState<PhotoSelectResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    if (!memo.trim()) return alert("写真メモを入力してください。");
    setLoading(true); setResult(null);
    try {
      setResult(await fetchJson<PhotoSelectResult>("/api/photo-select", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ photoMemo: memo, purpose, businessId: DEFAULT_BUSINESS_ID }) }));
    } catch (error) { alert(error instanceof Error ? error.message : "写真メモの確認に失敗しました。"); }
    finally { setLoading(false); }
  }

  const choices: Array<[PhotoPurpose, string]> = [["google_post","Google投稿"],["instagram","Instagram"],["story","ストーリー"],["anniversary","記念日"],["meo","MEO強化"],["line","常連様LINE"]];
  return <>
    <section id="photo" className="scroll-mt-4 mt-6 rounded-3xl bg-white p-5 shadow"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm tracking-[0.18em] text-amoretto-gold">PHOTO MEMO</p><h2 className="mt-1 text-xl font-semibold">写真メモから使い方を確認・試験版</h2></div><span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-800">写真選定AI</span></div><p className="mt-3 text-xs leading-6 text-stone-500">現在は実際の画像ではなく、入力された写真メモをもとに判断します。</p><label className="mt-5 block"><span className="text-sm font-semibold">写真メモ</span><textarea value={memo} onChange={(e)=>setMemo(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 outline-none focus:border-amoretto-gold" /></label><div className="mt-5"><p className="text-sm font-semibold">使いたい目的</p><div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">{choices.map(([value,label])=><button key={value} onClick={()=>setPurpose(value)} className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${purpose===value?"border-amoretto-wine bg-amoretto-wine text-white":"border-stone-300 bg-stone-50 text-amoretto-ink"}`}>{label}</button>)}</div></div><button onClick={check} disabled={loading} className="mt-5 w-full rounded-2xl bg-emerald-700 px-5 py-4 font-semibold text-white shadow disabled:opacity-60">{loading?"写真メモを確認中です…":"写真の使い方を確認する"}</button></section>
    {result && <section className="mt-6 space-y-4"><div className="rounded-3xl bg-white p-5 shadow"><h2 className="text-lg font-semibold">写真メモ確認結果</h2><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"><ScoreBox label="Google投稿" value={`${result.googleScore}点`} /><ScoreBox label="Instagram" value={`${result.instagramScore}点`} /><ScoreBox label="ストーリー" value={`${result.storyScore}点`} /></div>{[["最も向いている用途",result.bestUse],["写真から伝わる印象",result.impression],["トリミング・構図の助言",result.cropAdvice],["使う前に気をつける点",result.caution],["総合判断",result.recommendation]].map(([title,text])=><div key={title}><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 whitespace-pre-wrap leading-8">{text}</p></div>)}</div><ResultCard title="写真に添える短い文案" text={result.captionIdea} onCopy={()=>copyText("写真に添える短い文案",result.captionIdea)} /></section>}
  </>;
}
