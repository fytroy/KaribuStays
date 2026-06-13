"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Props {
  propertyId: string;
  initialBlocked: string[];
}

function toKey(d: Date) {
  return d.toISOString().split("T")[0];
}

export function AvailabilityCalendar({ propertyId, initialBlocked }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [blocked, setBlocked] = useState<Set<string>>(new Set(initialBlocked));
  const [selecting, setSelecting] = useState<string[]>([]);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  function prevMonth() { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); }

  function toggle(key: string) {
    setSelecting((s) => s.includes(key) ? s.filter((k) => k !== key) : [...s, key]);
  }

  async function save(isBlocked: boolean) {
    if (selecting.length === 0) return;
    setSaving(true); setMessage("");
    const res = await fetch(`/api/availability/${propertyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates: selecting, isBlocked }),
    });
    setSaving(false);
    if (res.ok) {
      setBlocked((b) => {
        const next = new Set(b);
        selecting.forEach((k) => isBlocked ? next.add(k) : next.delete(k));
        return next;
      });
      setSelecting([]);
      setMessage(isBlocked ? "Dates blocked." : "Dates unblocked.");
    }
  }

  const monthName = firstDay.toLocaleString("en-KE", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-cream-200 rounded-full transition-colors"><ChevronLeft size={18} /></button>
        <h2 className="font-display text-xl">{monthName}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-cream-200 rounded-full transition-colors"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-ink-700/50 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d}>{d}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = new Date(year, month, i + 1);
          const key = toKey(d);
          const isPast = d < today;
          const isBlocked = blocked.has(key);
          const isSelected = selecting.includes(key);

          return (
            <button
              key={key}
              type="button"
              disabled={isPast}
              onClick={() => !isPast && toggle(key)}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                isPast ? "text-ink-700/20 cursor-default" :
                isSelected ? "bg-clay-500 text-cream-100" :
                isBlocked ? "bg-forest-800 text-cream-100" :
                "hover:bg-cream-200 text-ink-900"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3 text-xs text-ink-700/60">
        <span className="w-4 h-4 rounded bg-forest-800 inline-block" /> Blocked
        <span className="w-4 h-4 rounded bg-clay-500 inline-block ml-3" /> Selected
      </div>

      {selecting.length > 0 && (
        <div className="mt-6 flex gap-3">
          <button onClick={() => save(true)} disabled={saving} className="btn-primary !py-2 !px-5 text-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : `Block ${selecting.length} date${selecting.length > 1 ? "s" : ""}`}
          </button>
          <button onClick={() => save(false)} disabled={saving} className="btn-ghost !py-2 !px-5 text-sm">
            Unblock
          </button>
          <button onClick={() => setSelecting([])} className="text-sm text-ink-700/60 hover:text-ink-900">
            Clear
          </button>
        </div>
      )}
      {message && <p className="mt-3 text-sm text-forest-800">{message}</p>}
    </div>
  );
}
