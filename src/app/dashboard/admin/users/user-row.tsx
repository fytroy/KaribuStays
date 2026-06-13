"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isHostVerified: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  _count: { properties: number; bookings: number };
}

export function UserRow({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function patch(data: Record<string, unknown>) {
    setLoading(true);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="p-4 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{user.name ?? "—"}</p>
        <p className="text-xs text-ink-700/60">{user.email} · {user._count.properties} props · {user._count.bookings} bookings</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap shrink-0 text-xs">
        <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${
          user.role === "ADMIN" ? "bg-forest-800 text-cream-100" :
          user.role === "HOST" ? "bg-clay-500/15 text-clay-600" :
          "bg-sand-400/30 text-ink-700"
        }`}>{user.role.toLowerCase()}</span>

        {user.role === "HOST" && (
          <button
            disabled={loading}
            onClick={() => patch({ isHostVerified: !user.isHostVerified })}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${
              user.isHostVerified
                ? "border-forest-800 text-forest-800 hover:bg-forest-800/10"
                : "border-sand-400/40 text-ink-700/50 hover:border-forest-800"
            }`}
          >
            <ShieldCheck size={12} />
            {user.isHostVerified ? "Verified" : "Verify host"}
          </button>
        )}

        <select
          value={user.role}
          disabled={loading}
          onChange={(e) => patch({ role: e.target.value })}
          className="bg-transparent border border-sand-400/40 rounded px-1 py-0.5 text-xs"
        >
          {["GUEST", "HOST", "ADMIN"].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
    </div>
  );
}
