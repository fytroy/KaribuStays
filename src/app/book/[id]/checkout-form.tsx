"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Loader2, Check, RefreshCw } from "lucide-react";

interface Props {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalKES: number;
}

type Status = "idle" | "creating" | "pushing" | "waiting" | "success" | "failed" | "timeout";

export function CheckoutForm({ propertyId, checkIn, checkOut, guests, totalKES }: Props) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [bookingRef, setBookingRef] = useState("");

  async function pollStatus(id: string) {
    setStatus("waiting");
    const TIMEOUT = 90_000;
    const start = Date.now();
    let delay = 3000;

    while (Date.now() - start < TIMEOUT) {
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 1.5, 15000);

      try {
        const check = await fetch(`/api/bookings/${id}`);
        if (check.ok) {
          const b = await check.json();
          if (b.status === "CONFIRMED") { setStatus("success"); setTimeout(() => router.push("/dashboard/guest"), 1500); return; }
          if (b.status === "CANCELLED") { setStatus("failed"); setError("Payment was declined or cancelled. Please try again."); return; }
        }
      } catch { /* network hiccup — keep polling */ }
    }

    setStatus("timeout");
    setError(`Payment timed out. If your M-Pesa was charged, contact support with reference ${bookingRef}.`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("creating");

    try {
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, checkIn, checkOut, guests, guestNote: note }),
      });
      if (!bookingRes.ok) throw new Error((await bookingRes.json()).error ?? "Booking failed");
      const booking = await bookingRes.json();
      setBookingId(booking.id);
      setBookingRef(booking.reference);

      setStatus("pushing");
      const payRes = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, phone }),
      });
      if (!payRes.ok) throw new Error((await payRes.json()).error ?? "M-Pesa push failed");

      await pollStatus(booking.id);
    } catch (err: any) {
      setStatus("failed");
      setError(err.message);
    }
  }

  async function recheckStatus() {
    if (!bookingId) return;
    setError("");
    await pollStatus(bookingId);
  }

  if (status === "success") {
    return (
      <div className="card p-8 text-center">
        <Check className="mx-auto text-forest-800" size={48} />
        <h2 className="font-display text-2xl mt-4">Payment confirmed</h2>
        <p className="text-sm text-ink-700/70 mt-2">Reference {bookingRef}. Redirecting to your trip…</p>
      </div>
    );
  }

  const isWaiting = status === "waiting" || status === "pushing" || status === "creating";
  const canSubmit = status === "idle" || status === "failed";
  const showRecheck = status === "timeout";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-display text-2xl mb-1">Pay with M-Pesa</h2>
        <p className="text-sm text-ink-700/70">You'll get an STK push prompt on your phone. Enter your M-Pesa PIN to confirm.</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">M-Pesa phone number</label>
        <div className="relative">
          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-500" />
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX or 2547XX XXX XXX" className="input-base pl-10" required
            pattern="^(\+?254|0)?[71]\d{8}$"
            disabled={!canSubmit} />
        </div>
        <p className="text-xs text-ink-700/60 mt-1">Safaricom number registered to M-Pesa.</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Message to host (optional)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
          placeholder="Anything they should know about your stay…" className="input-base resize-none"
          disabled={!canSubmit} />
      </div>
      {error && (
        <div className="rounded-lg bg-clay-500/10 border border-clay-500/30 px-4 py-3 text-sm text-clay-600">{error}</div>
      )}
      {!showRecheck && (
        <button type="submit" disabled={!canSubmit} className="btn-accent w-full">
          {canSubmit ? `Pay KES ${totalKES.toLocaleString()}` : (
            <>
              <Loader2 size={16} className="animate-spin" />
              {status === "creating" && "Creating booking…"}
              {status === "pushing" && "Sending M-Pesa prompt…"}
              {status === "waiting" && "Waiting for your M-Pesa confirmation…"}
            </>
          )}
        </button>
      )}
      {showRecheck && (
        <div className="space-y-3">
          <button type="button" onClick={recheckStatus} className="btn-primary w-full flex items-center justify-center gap-2">
            <RefreshCw size={16} /> Check payment status
          </button>
          <button type="submit" className="btn-ghost w-full text-sm">Try again with a new booking</button>
        </div>
      )}
      {isWaiting && (
        <p className="text-xs text-ink-700/60 text-center">
          Your booking is held while we await M-Pesa confirmation. Do not close this page.
        </p>
      )}
    </form>
  );
}
