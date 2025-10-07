"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { KeyRound } from "lucide-react";

/**
 * Subtle floating admin button.
 * - Low opacity by default (not visually prominent)
 * - On click, prompts for ADMIN_TOKEN and logs in via /api/admin/login
 * - Then routes to /dashboard/results/manual (or refreshes if already there)
 */
export default function AdminQuickAccess() {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    const token = window.prompt("Enter admin token");
    if (!token) return;

    try {
      setBusy(true);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Invalid token");
        return;
      }
      if (pathname?.startsWith("/dashboard/results")) {
        router.refresh();
      } else {
        router.push("/dashboard/results/manual");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      aria-label="Admin"
      title="Admin"
      onClick={onClick}
      disabled={busy}
      className={`fixed bottom-4 right-4 h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-sm shadow-sm flex items-center justify-center transition
        opacity-30 hover:opacity-90 focus:opacity-90 active:opacity-100 z-50
        ${busy ? "animate-pulse" : ""}`}
    >
      <KeyRound className="h-4 w-4" />
    </button>
  );
}
