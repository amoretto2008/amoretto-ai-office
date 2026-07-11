type Props = {
  title: string;
  text: string;
  onCopy: () => void;
};

export function ResultCard({ title, text, onCopy }: Props) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onCopy}
          className="rounded-full border border-amoretto-gold px-4 py-2 text-sm text-amoretto-navy"
        >
          コピー
        </button>
      </div>
      <p className="mt-4 whitespace-pre-wrap leading-8">{text}</p>
    </article>
  );
}
