"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="container-narrow py-20 max-w-md mx-auto">
      <h1 className="display-lg mb-2">Welcome back.</h1>
      <p className="text-sm text-ink-700/70 mb-8">Sign in to continue.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-base" />
        </div>
        {error && <p className="text-sm text-clay-600">{error}</p>}
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-ink-700/60 hover:text-clay-500">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-ink-700/50">
        <div className="flex-1 border-t border-sand-400/40" /> or <div className="flex-1 border-t border-sand-400/40" />
      </div>

      <button onClick={() => signIn("google", { callbackUrl })} className="btn-ghost w-full">
        Continue with Google
      </button>

      <p className="mt-8 text-sm text-center text-ink-700/70">
        New here? <Link href="/signup" className="text-clay-500 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
