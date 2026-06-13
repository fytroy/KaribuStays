"use client";
import { useState } from "react";
import { formatKES } from "@/lib/utils";

interface Props {
  balance: number;
  phone?: string | null;
}

export function PayoutWidget({ balance, phone }: Props) {
  const [amount, setAmount] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState(phone ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function request(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setMessage("");
    const cents = Math.round(Number(amount) * 100);
    if (!cents || cents < 100) { setError("Minimum payout is KES 1."); return; }
    setLoading(true);
    const res = await fetch("/api/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: cents, method: "MPESA", phone: mpesaPhone }),
    });
    setLoading(false);
    if (!res.ok) { setError((await res.json()).error ?? "Request failed"); return; }
    setMessage("Payout request submitted. We'll process it within 1–2 business days.");
    setAmount("");
  }

  return (
    <div className="card p-6">
      <h2 className="font-display text-2xl mb-1">Request payout</h2>
      <p className="text-sm text-ink-700/60 mb-6">
        Available balance: <span className="font-medium text-ink-900">{formatKES(balance)}</span>
      </p>
      <form onSubmit={request} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Amount (KES)</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
            max={balance / 100}
            step={1}
            required
            placeholder={`Up to KES ${(balance / 100).toLocaleString()}`}
            className="input-base"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">M-Pesa number</span>
          <input
            type="tel"
            value={mpesaPhone}
            onChange={(e) => setMpesaPhone(e.target.value)}
            required
            placeholder="07XX XXX XXX"
            className="input-base"
          />
        </label>
        {error && <p className="text-sm text-clay-600">{error}</p>}
        {message && <p className="text-sm text-forest-800">{message}</p>}
        <button type="submit" disabled={loading || balance === 0} className="btn-primary">
          {loading ? "Submitting…" : "Request payout"}
        </button>
      </form>
    </div>
  );
}
