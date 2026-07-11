export function CopyFeedback({ label }: { label: string }) {
  if (!label) return null;
  return (
    <div className="mt-4 rounded-2xl bg-amoretto-gold/20 px-4 py-3 text-sm">
      {label}をコピーしました。
    </div>
  );
}
