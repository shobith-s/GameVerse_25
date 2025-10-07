async function fetchEnv() {
const res = await fetch("http://localhost:3000/api/env", { cache: "no-store" });
return res.json();
}


export default async function EnvDebugPage() {
const data = await fetchEnv();
return (
<div className="space-y-4">
<h1 className="text-2xl font-bold">Env Debug</h1>
<pre className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm overflow-x-auto">
{JSON.stringify(data, null, 2)}
</pre>
<p className="text-white/70 text-sm">
Ensure <code>.env.local</code> lives in your Next.js root (same folder as <code>package.json</code> you run <code>npm run dev</code> from).
</p>
</div>
);
}