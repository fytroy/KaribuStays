"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"GUEST" | "HOST">("GUEST");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone, role }),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Sign up failed");
      setLoading(false);
      return;
    }
    await signIn("credentials", { 
      email, 
      password, 
      redirect: true, 
      callbackUrl: role === "HOST" ? "/dashboard/host" : "/" 
    });
  }

  return (
    <div className="container-narrow py-16 max-w-md mx-auto">
      <h1 className="display-lg mb-2">Create your account.</h1>
      <p className="text-sm text-ink-700/70 mb-8">Karibu.</p>

      <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-cream-200 mb-6">
        <button onClick={() => setRole("GUEST")} className={`rounded-full py-2 text-sm transition ${role === "GUEST" ? "bg-cream-50 shadow-sm" : "text-ink-700/60"}`}>I'm a guest</button>
        <button onClick={() => setRole("HOST")} className={`rounded-full py-2 text-sm transition ${role === "HOST" ? "bg-cream-50 shadow-sm" : "text-ink-700/60"}`}>I'm a host</button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Full name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Phone (M-Pesa)</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" className="input-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input-base" />
        </div>
        {error && <p className="text-sm text-clay-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-sm text-center text-ink-700/70">
        Already have an account? <Link href="/signin" className="text-clay-500 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
