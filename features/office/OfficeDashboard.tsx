"use client";

import { useState } from "react";
import { APP_CONFIG } from "@/lib/app-config";
import { LogoutButton } from "@/components/LogoutButton";
import { ProductIntro } from "@/components/ProductIntro";
import { SectionNav } from "@/components/SectionNav";
import { AIContentNotice } from "@/components/AIContentNotice";
import { CopyFeedback } from "@/components/ui/CopyFeedback";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { PostComposerSection } from "@/features/posting/PostComposerSection";
import { ReviewReplySection } from "@/features/reviews/ReviewReplySection";
import { MeoCheckSection } from "@/features/meo/MeoCheckSection";
import { PhotoAdvisorSection } from "@/features/photos/PhotoAdvisorSection";
import { PostHistorySection } from "@/features/history/PostHistorySection";

export function OfficeDashboard() {
  const [latestGooglePost, setLatestGooglePost] = useState("");
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const { copiedLabel, copyText } = useCopyFeedback();

  return <main className="min-h-screen px-4 py-6 sm:px-6"><div className="mx-auto max-w-3xl">
    <header className="mb-6 rounded-3xl bg-amoretto-navy px-5 py-6 text-amoretto-ivory shadow-lg"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm tracking-[0.25em] text-amoretto-gold">AMORÉTTO</p><h1 className="mt-2 text-3xl font-semibold">{APP_CONFIG.name}</h1><p className="mt-2 text-sm font-semibold text-amoretto-gold">{APP_CONFIG.moduleName}・{APP_CONFIG.stage}</p></div><LogoutButton /></div><p className="mt-4 text-sm leading-7 text-amoretto-ivory/85">店主の頭の中にある気持ちを言葉にし、投稿・口コミ返信・MEO文章確認・写真メモ確認を支えます。</p></header>
    <ProductIntro />
    <SectionNav />
    <PostComposerSection copyText={copyText} onGooglePostGenerated={setLatestGooglePost} onHistoryCreated={()=>setHistoryRefresh((x)=>x+1)} />
    <ReviewReplySection copyText={copyText} />
    <MeoCheckSection suggestedText={latestGooglePost} copyText={copyText} />
    <PhotoAdvisorSection copyText={copyText} />
    <AIContentNotice />
    <CopyFeedback label={copiedLabel} />
    <PostHistorySection refreshToken={historyRefresh} copyText={copyText} />
  </div></main>;
}
