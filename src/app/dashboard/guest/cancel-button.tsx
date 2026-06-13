"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function cancel() {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Cancelled by guest" }),
    });
    setLoading(false);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-xs text-clay-500 hover:text-clay-600 font-medium">
        Cancel booking
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-ink-700/70">Are you sure?</span>
      <button onClick={cancel} disabled={loading} className="font-medium text-clay-600 hover:text-clay-700">
        {loading ? "Cancelling…" : "Yes, cancel"}
      </button>
      <button onClick={() => setConfirming(false)} className="text-ink-700/60 hover:text-ink-900">
        Keep it
      </button>
    </div>
  );
}
