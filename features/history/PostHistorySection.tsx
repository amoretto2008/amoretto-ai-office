"use client";

import { useEffect, useState } from "react";
import { DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import { fetchJson } from "@/lib/client/fetch-json";
import { HistoryItem } from "@/features/shared/types";
import { purposeBadgeStyles, purposeLabels } from "@/lib/types";

export function PostHistorySection({ refreshToken, copyText }: { refreshToken: number; copyText: (label: string, text: string) => Promise<void> }) {
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  async function load() {
    try {
      const data = await fetchJson<{ histories: HistoryItem[] }>(`/api/history?businessId=${DEFAULT_BUSINESS_ID}`, { cache: "no-store" });
      setHistories(data.histories ?? []);
    } catch { setHistories([]); }
  }
  useEffect(() => { void load(); }, [refreshToken]);

  async function remove(id: string) {
    if (!window.confirm("この投稿履歴を削除しますか？")) return;
    try {
      await fetchJson("/api/delete-history", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ id, businessId: DEFAULT_BUSINESS_ID }) });
      setHistories((items)=>items.filter((x)=>x.id!==id));
    } catch (error) { alert(error instanceof Error ? error.message : "削除に失敗しました。"); }
  }

  async function toggle(item: HistoryItem) {
    try {
      const data = await fetchJson<{ history: { is_posted: boolean; posted_at: string | null } }>("/api/toggle-posted", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ id: item.id, isPosted: !item.is_posted, businessId: DEFAULT_BUSINESS_ID }) });
      setHistories((items)=>items.map((x)=>x.id===item.id?{...x,is_posted:data.history.is_posted,posted_at:data.history.posted_at}:x));
    } catch (error) { alert(error instanceof Error ? error.message : "更新に失敗しました。"); }
  }

  return <section id="history" className="scroll-mt-4 mt-8 rounded-3xl bg-white p-5 shadow"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">投稿履歴</h2><button onClick={load} className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-600">更新</button></div>{histories.length===0?<p className="mt-3 text-sm text-stone-500">まだ履歴はありません。</p>:<div className="mt-4 space-y-3">{histories.map((item)=><article key={item.id} className={`rounded-2xl border p-4 ${item.is_posted?"border-amoretto-gold bg-amoretto-gold/10":"border-stone-200 bg-white"}`}><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-3 py-1 text-xs ${purposeBadgeStyles[item.purpose]}`}>{purposeLabels[item.purpose]}</span>{item.is_posted&&<span className="rounded-full border border-amoretto-gold bg-white px-3 py-1 text-xs text-amoretto-navy">投稿済み</span>}<span className="text-xs text-stone-500">{new Date(item.created_at).toLocaleString("ja-JP")}</span></div>{item.is_posted&&item.posted_at&&<p className="mt-2 text-xs text-stone-500">投稿済み記録：{new Date(item.posted_at).toLocaleString("ja-JP")}</p>}<p className="mt-3 text-sm font-semibold">{item.situation}</p><p className="mt-2 line-clamp-3 text-sm leading-7 text-stone-700">{item.google_post}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>copyText("履歴のGoogle投稿文",item.google_post)} className="rounded-full border border-amoretto-gold px-4 py-2 text-xs text-amoretto-navy">コピー</button><button onClick={()=>toggle(item)} className={`rounded-full border px-4 py-2 text-xs ${item.is_posted?"border-stone-300 text-stone-600":"border-amoretto-wine bg-amoretto-wine text-white"}`}>{item.is_posted?"未投稿に戻す":"投稿済みにする"}</button><button onClick={()=>remove(item.id)} className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-600">削除</button></div></article>)}</div>}</section>;
}
