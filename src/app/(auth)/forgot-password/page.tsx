"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="container-narrow py-20 max-w-md mx-auto text-center">
        <h1 className="display-lg mb-4">Check your inbox</h1>
        <p className="text-sm text-ink-700/70">If an account exists for <strong>{email}</strong>, we've sent a reset link.</p>
        <Link href="/signin" className="btn-primary mt-8 inline-flex">Back to sign in</Link>
      </div>
    );
  }

  return (
    <div className="container-narrow py-20 max-w-md mx-auto">
      <h1 className="display-lg mb-2">Forgot password?</h1>
      <p className="text-sm text-ink-700/70 mb-8">Enter your email and we'll send a reset link.</p>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" />
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-sm text-center">
        <Link href="/signin" className="text-clay-500 hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}
