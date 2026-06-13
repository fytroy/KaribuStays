"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatKES, nightsBetween, calcBookingTotals } from "@/lib/utils";

interface Props {
  propertyId: string;
  pricePerNight: number;
  cleaningFee: number;
  maxGuests: number;
  minNights: number;
  currency: string;
}

export function BookingWidget({ propertyId, pricePerNight, cleaningFee, maxGuests, minNights }: Props) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return nightsBetween(new Date(checkIn), new Date(checkOut));
  }, [checkIn, checkOut]);

  const totals = useMemo(() => {
    if (nights === 0) return null;
    return calcBookingTotals(pricePerNight, cleaningFee, nights);
  }, [nights, pricePerNight, cleaningFee]);

  const tooShort = nights > 0 && nights < minNights;

  function reserve() {
    if (!checkIn || !checkOut || tooShort) return;
    const params = new URLSearchParams({ propertyId, checkIn, checkOut, guests: String(guests) });
    router.push(`/book/${propertyId}?${params.toString()}`);
  }

  return (
    <div className="card p-6 shadow-lg shadow-forest-900/5">
      <div className="flex items-baseline justify-between mb-4">
        <p><span className="font-display text-2xl">{formatKES(pricePerNight)}</span><span className="text-sm text-ink-700/60"> per night</span></p>
      </div>
      <div className="border border-sand-400/40 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-sand-400/40">
          <label className="p-3 cursor-text">
            <span className="block text-[0.65rem] uppercase tracking-wider text-forest-800/70 font-medium">Check in</span>
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-0.5 w-full bg-transparent text-sm focus:outline-none" />
          </label>
          <label className="p-3 cursor-text">
            <span className="block text-[0.65rem] uppercase tracking-wider text-forest-800/70 font-medium">Check out</span>
            <input type="date" value={checkOut} min={checkIn || undefined} onChange={(e) => setCheckOut(e.target.value)} className="mt-0.5 w-full bg-transparent text-sm focus:outline-none" />
          </label>
        </div>
        <label className="block p-3 border-t border-sand-400/40 cursor-pointer">
          <span className="block text-[0.65rem] uppercase tracking-wider text-forest-800/70 font-medium">Guests</span>
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="mt-0.5 w-full bg-transparent text-sm focus:outline-none">
            {Array.from({ length: maxGuests }).map((_, i) => (
              <option key={i} value={i + 1}>{i + 1} {i === 0 ? "guest" : "guests"}</option>
            ))}
          </select>
        </label>
      </div>
      {tooShort && <p className="mt-2 text-xs text-clay-600">Minimum stay is {minNights} {minNights === 1 ? "night" : "nights"}.</p>}
      <button onClick={reserve} disabled={!checkIn || !checkOut || tooShort} className="btn-accent w-full mt-4">
        {nights > 0 ? "Reserve" : "Pick dates"}
      </button>
      {totals && (
        <div className="mt-4 space-y-2 text-sm">
          <Row label={`${formatKES(pricePerNight)} × ${nights} ${nights === 1 ? "night" : "nights"}`} value={formatKES(totals.subtotal)} />
          {totals.cleaningFee > 0 && <Row label="Cleaning fee" value={formatKES(totals.cleaningFee)} />}
          <Row label="Service fee" value={formatKES(totals.serviceFee)} muted />
          <div className="pt-2 border-t border-sand-400/40">
            <Row label="Total (KES)" value={formatKES(totals.total)} bold />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-ink-700/60" : ""} ${bold ? "font-medium text-base" : ""}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
