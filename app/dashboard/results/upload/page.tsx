// app/dashboard/results/upload/page.tsx
// Server component wrapper — no hooks, no "use client" here.

import UploadForm from "./upload-form";

export const dynamic = "force-dynamic"; // keep fresh while uploading

export default function UploadResultsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h1 className="text-2xl font-bold">Upload Results (CSV / Paste)</h1>
        <p className="text-white/60">
          Paste results for BGMI / Free Fire in CSV or table format: <code>team_name,placement,kills</code>
        </p>
      </section>

      <UploadForm />
    </div>
  );
}
