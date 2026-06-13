"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", String(guests));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="relative rounded-2xl bg-cream-50 shadow-xl shadow-forest-900/5 border border-sand-400/30 p-2 flex flex-col md:flex-row gap-1 md:items-stretch">
      <Field icon={<MapPin size={16} />} label="Where">
        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Nairobi, Diani, Watamu…" className="w-full bg-transparent text-sm placeholder:text-sand-500 focus:outline-none" />
      </Field>
      <Divider />
      <Field icon={<Calendar size={16} />} label="Check in">
        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent text-sm focus:outline-none" />
      </Field>
      <Divider />
      <Field icon={<Calendar size={16} />} label="Check out">
        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent text-sm focus:outline-none" />
      </Field>
      <Divider />
      <Field icon={<Users size={16} />} label="Guests">
        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent text-sm focus:outline-none">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
          ))}
        </select>
      </Field>
      <button type="submit" className="md:ml-2 inline-flex items-center justify-center gap-2 rounded-xl bg-clay-500 px-6 py-3.5 text-sm font-medium text-cream-100 hover:bg-clay-600 transition-colors">
        <Search size={16} />Search
      </button>
    </form>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="flex-1 px-4 py-2 rounded-xl hover:bg-cream-200/50 transition-colors cursor-text">
      <div className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-forest-800/70">{icon}<span>{label}</span></div>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}

function Divider() { return <div className="hidden md:block w-px self-stretch bg-sand-400/30 my-2" />; }
