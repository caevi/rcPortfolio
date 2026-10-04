export function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mb-12 max-w-2xl">
      <p className="mb-3 font-mono text-sm uppercase tracking-[0.2em] text-red-500">{eyebrow}</p>
      <h2 className="text-4xl font-semibold tracking-tight text-neutral-50 sm:text-5xl">{title}</h2>
    </header>
  );
}
