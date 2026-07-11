const sections = [
  { href: "#post", label: "投稿文" },
  { href: "#review", label: "口コミ返信" },
  { href: "#meo", label: "MEO確認" },
  { href: "#photo", label: "写真メモ" },
  { href: "#history", label: "投稿履歴" },
];

export function SectionNav() {
  return (
    <nav
      aria-label="機能選択"
      className="mb-6 grid grid-cols-2 gap-2 rounded-3xl bg-white p-4 shadow sm:grid-cols-5"
    >
      {sections.map((section) => (
        <a
          key={section.href}
          href={section.href}
          className="rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-center text-sm font-semibold text-amoretto-navy transition hover:border-amoretto-gold hover:bg-amoretto-gold/10"
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
