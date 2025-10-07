import type { ReactNode } from "react";

export function GameCard({
  icon,
  title,
  tag,
  bullets,
}: { icon: ReactNode; title: string; tag: string; bullets: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10">{icon}</div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm">{tag}</span>
      </div>
      <ul className="mt-3 space-y-2 text-white/80">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-white/70" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
