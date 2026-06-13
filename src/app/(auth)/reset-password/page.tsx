"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (!res.ok) { setError((await res.json()).error ?? "Reset failed"); return; }
    router.push("/signin?reset=1");
  }

  if (!token) {
    return (
      <div className="container-narrow py-20 max-w-md mx-auto text-center">
        <p className="text-clay-600">Invalid reset link.</p>
        <Link href="/forgot-password" className="btn-primary mt-6 inline-flex">Try again</Link>
      </div>
    );
  }

  return (
    <div className="container-narrow py-20 max-w-md mx-auto">
      <h1 className="display-lg mb-2">New password</h1>
      <p className="text-sm text-ink-700/70 mb-8">Choose a strong password for your account.</p>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">New password</span>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input-base" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Confirm password</span>
          <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-base" />
        </label>
        {error && <p className="text-sm text-clay-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Saving…" : "Set new password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
