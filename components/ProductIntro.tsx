import { APP_CONFIG } from "@/lib/app-config";

export function ProductIntro() {
  return <section className="mb-6 rounded-3xl border border-amoretto-gold/40 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-amoretto-wine px-3 py-1 text-xs text-white">{APP_CONFIG.stage}</span><span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs text-stone-600">MVP {APP_CONFIG.version}</span><span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs text-stone-600">{APP_CONFIG.architecture}</span></div><p className="mt-4 text-lg font-semibold text-amoretto-navy">{APP_CONFIG.mission}</p><p className="mt-2 text-sm leading-7 text-stone-600">今ある機能を壊さず、最終形の「店舗ごとのAI社員オフィス」へ機能単位で移せる構造に整理しています。</p></section>;
}
