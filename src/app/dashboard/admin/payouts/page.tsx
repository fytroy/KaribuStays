import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatKES } from "@/lib/utils";
import { PayoutAction } from "./payout-action";

export default async function AdminPayoutsPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  if (session.user.role !== "ADMIN") redirect("/");

  const payouts = await prisma.payout.findMany({
    include: { host: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const pending = payouts.filter((p) => p.status === "PENDING");
  const rest = payouts.filter((p) => p.status !== "PENDING");

  return (
    <div className="container-narrow py-12">
      <p className="eyebrow">Admin</p>
      <h1 className="display-lg mt-2 mb-10">Payout requests</h1>

      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl mb-4">Pending ({pending.length})</h2>
          <div className="card divide-y divide-sand-400/20">
            {pending.map((p) => (
              <div key={p.id} className="p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{p.host.name}</p>
                  <p className="text-xs text-ink-700/60">{p.host.email} · {p.method} {p.phone ?? p.bankAccount}</p>
                </div>
                <p className="font-medium">{formatKES(p.amount)}</p>
                <PayoutAction payoutId={p.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <h2 className="font-display text-xl mb-4">History</h2>
          <div className="card divide-y divide-sand-400/20">
            {rest.map((p) => (
              <div key={p.id} className="p-4 flex items-center gap-4 text-sm flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{p.host.name}</p>
                  <p className="text-xs text-ink-700/60">{p.method} · {p.phone ?? p.bankAccount}</p>
                </div>
                <p>{formatKES(p.amount)}</p>
                <span className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  p.status === "PAID" ? "bg-forest-800 text-cream-100" :
                  p.status === "FAILED" ? "bg-clay-500/15 text-clay-600" :
                  "bg-sand-400/30 text-ink-700"
                }`}>{p.status.toLowerCase()}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {payouts.length === 0 && <p className="text-sm text-ink-700/60">No payout requests yet.</p>}
    </div>
  );
}
