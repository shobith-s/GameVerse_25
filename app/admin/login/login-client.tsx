"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginClient() {
  const params = useSearchParams();
  const [token, setToken] = useState("");

  const next = params.get("next") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: call your server action or /api route to validate `token`
    // and set the admin cookie, then redirect to `next`.
    // Example (if you already have an action):
    // const ok = await loginAdmin(token, next)
    // if (ok) router.push(next)
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      <input
        className="w-full rounded-md border border-white/10 bg-black/20 p-3 outline-none"
        placeholder="Admin token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        type="password"
        autoComplete="off"
      />
      <button
        type="submit"
        className="w-full rounded-md bg-white px-4 py-2 font-medium text-black"
      >
        Continue
      </button>
      <p className="text-xs text-white/60">After login, you’ll be sent to: {next}</p>
    </form>
  );
}
