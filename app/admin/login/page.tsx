"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard/results/manual";

  const submit = () => {
    setErr("");
    start(async () => {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j?.error || "Invalid token");
        return;
      }
      router.push(next);
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <input
          type="password"
          placeholder="Admin token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2"
        />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button
          onClick={submit}
          disabled={pending || !token}
          className="w-full inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border bg-white text-black hover:bg-white/90 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </main>
  );
}
