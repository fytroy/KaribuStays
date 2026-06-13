"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SUB_RATINGS = [
  { key: "cleanliness", label: "Cleanliness" },
  { key: "accuracy", label: "Accuracy" },
  { key: "location", label: "Location" },
  { key: "value", label: "Value" },
] as const;

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`text-2xl transition-colors ${n <= value ? "text-clay-500" : "text-sand-400"}`}>
          ★
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [subs, setSubs] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select an overall rating."); return; }
    setError("");
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment, ...subs }),
    });
    setLoading(false);
    if (!res.ok) { setError((await res.json()).error ?? "Failed"); return; }
    router.push("/dashboard/guest");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <div>
        <p className="text-sm font-medium mb-2">Overall rating</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SUB_RATINGS.map(({ key, label }) => (
          <div key={key}>
            <p className="text-sm font-medium mb-1.5">{label}</p>
            <StarPicker value={subs[key] ?? 0} onChange={(n) => setSubs((s) => ({ ...s, [key]: n }))} />
          </div>
        ))}
      </div>

      <label className="block">
        <span className="block text-sm font-medium mb-1.5">Your review</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          minLength={10}
          rows={5}
          placeholder="What made this stay special? What could be better?"
          className="input-base resize-none"
        />
      </label>

      {error && <p className="text-sm text-clay-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
