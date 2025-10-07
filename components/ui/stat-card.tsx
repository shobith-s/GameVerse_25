import type { ReactNode } from "react";

export function StatCard({
  icon,
  value,
  label,
}: { icon: ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-white/10">
        {icon}
      </div>
      <div className="text-3xl font-bold leading-none">{value}</div>
      <div className="mt-1 text-white/60 text-sm">{label}</div>
    </div>
  );
}
