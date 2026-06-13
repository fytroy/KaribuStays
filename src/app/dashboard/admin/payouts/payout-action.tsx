"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayoutAction({ payoutId }: { payoutId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(status: "PAID" | "FAILED") {
    setLoading(true);
    await fetch("/api/admin/payouts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: payoutId, status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-xs shrink-0">
      <button disabled={loading} onClick={() => update("PAID")}
        className="px-3 py-1 rounded-full bg-forest-800 text-cream-100 hover:bg-forest-900 transition-colors">
        Mark paid
      </button>
      <button disabled={loading} onClick={() => update("FAILED")}
        className="px-3 py-1 rounded-full border border-clay-500/40 text-clay-600 hover:bg-clay-500/10 transition-colors">
        Reject
      </button>
    </div>
  );
}
