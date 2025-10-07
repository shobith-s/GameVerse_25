import { Calendar as CalendarIcon } from "lucide-react";

export function MatchCard({ title, date, time }: { title: string; date: string; time: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
        Scheduled
      </div>
      <h4 className="mt-3 text-xl font-semibold">{title}</h4>
      <div className="mt-2 flex items-center gap-3 text-white/70">
        <CalendarIcon className="h-4 w-4" />
        <span>{date}</span>
        <span>•</span>
        <span>{time}</span>
      </div>
    </div>
  );
}
