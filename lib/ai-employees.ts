export type AiEmployeeStatus = "active" | "planned";

export type AiEmployee = {
  id: string;
  name: string;
  role: string;
  status: AiEmployeeStatus;
};

// 将来の「AI社員会議室」で討論に参加する8名。
// 違和感チェックは、会議全体を確認する品質管理レイヤーとして別に扱います。
export const AI_EMPLOYEES: AiEmployee[] = [
  {
    id: "manager",
    name: "AMORÉTTO店長AI",
    role: "店の品格・方針・最終判断",
    status: "planned",
  },
  {
    id: "meo",
    name: "MEO集客AI",
    role: "Googleマップ集客・投稿文の確認",
    status: "active",
  },
  {
    id: "post",
    name: "投稿文AI",
    role: "Google投稿・Instagram・LINE文",
    status: "active",
  },
  {
    id: "reply",
    name: "お客様返信AI",
    role: "口コミ返信・問い合わせ対応",
    status: "active",
  },
  {
    id: "photo",
    name: "写真選定AI",
    role: "写真メモをもとにした使い方の提案",
    status: "active",
  },
  {
    id: "anniversary",
    name: "記念日プランAI",
    role: "誕生日・記念日・接待向け提案",
    status: "planned",
  },
  {
    id: "sales",
    name: "売上改善AI",
    role: "予約導線・客単価・空席対策",
    status: "planned",
  },
  {
    id: "assistant",
    name: "創一さん補佐AI",
    role: "会議整理・優先順位・実行支援",
    status: "planned",
  },
];

export const AI_QUALITY_GUARD = {
  id: "tone-check",
  name: "違和感AI",
  role: "押し売り感・不自然さ・店らしさの最終確認",
  status: "active" as const,
};
