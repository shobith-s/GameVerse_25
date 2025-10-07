export function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-2xl font-bold">
        {num}
      </div>
      <h4 className="text-xl font-semibold">{title}</h4>
      <p className="text-white/60 max-w-sm">{desc}</p>
    </div>
  );
}
