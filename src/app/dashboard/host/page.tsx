import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatKES, formatDate } from "@/lib/utils";
import { Plus, Home, CalendarCheck, TrendingUp } from "lucide-react";
import { PayoutWidget } from "./payout-widget";

export default async function HostDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/dashboard/host");

  const userId = session.user.id;
  const role = session.user.role;
  if (role !== "HOST" && role !== "ADMIN") {
    redirect("/dashboard/guest");
  }

  const [properties, bookings, monthRevenue, allRevenue, paidOut] = await Promise.all([
    prisma.property.findMany({
      where: { hostId: userId },
      include: { images: { take: 1, orderBy: { order: "asc" } }, _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      where: { property: { hostId: userId }, status: { in: ["CONFIRMED", "PENDING"] } },
      include: { property: true, guest: { select: { name: true, image: true } } },
      orderBy: { checkIn: "asc" },
      take: 5,
    }),
    prisma.booking.aggregate({
      where: {
        property: { hostId: userId },
        status: "CONFIRMED",
        createdAt: { gte: new Date(new Date().setDate(1)) },
      },
      _sum: { total: true },
    }),
    prisma.booking.aggregate({
      where: { property: { hostId: userId }, status: "CONFIRMED" },
      _sum: { total: true },
    }),
    prisma.payout.aggregate({
      where: { hostId: userId, status: { in: ["PENDING", "PROCESSING", "PAID"] } },
      _sum: { amount: true },
    }),
  ]);

  const payoutBalance = (allRevenue._sum.total ?? 0) - (paidOut._sum.amount ?? 0);

  return (
    <div className="container-narrow py-12">
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="eyebrow">Host dashboard</p>
          <h1 className="display-lg mt-2">Habari, {session.user.name?.split(" ")[0]}.</h1>
        </div>
        <Link href="/dashboard/host/properties/new" className="btn-accent">
          <Plus size={16} /> Add a property
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <Kpi icon={<Home size={18} />} label="Active listings" value={properties.filter(p => p.status === "PUBLISHED").length} />
        <Kpi icon={<CalendarCheck size={18} />} label="Upcoming stays" value={bookings.length} />
        <Kpi icon={<TrendingUp size={18} />} label="This month" value={formatKES(monthRevenue._sum.total ?? 0)} />
      </div>

      {/* Properties */}
      <section className="mb-14">
        <h2 className="font-display text-2xl mb-5">Your properties</h2>
        {properties.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-display text-xl">No properties yet.</p>
            <Link href="/dashboard/host/properties/new" className="btn-primary mt-5 inline-flex">
              List your first place
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <Link key={p.id} href={`/properties/${p.slug}`} className="card overflow-hidden group">
                <div className="relative aspect-[5/3] bg-sand-400/20">
                  {p.images[0] && (
                    <Image src={p.images[0].url} alt={p.title} fill className="object-cover" />
                  )}
                  <span className={`absolute top-3 left-3 text-[0.65rem] uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    p.status === "PUBLISHED" ? "bg-forest-800 text-cream-100"
                    : p.status === "DRAFT" ? "bg-cream-200 text-ink-700"
                    : "bg-clay-500/20 text-clay-600"
                  }`}>
                    {p.status.toLowerCase()}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg truncate group-hover:text-clay-500">{p.title}</h3>
                  <p className="text-xs text-ink-700/60 mt-1">{p.city} · {p._count.bookings} bookings</p>
                  <p className="text-sm mt-2 font-medium">{formatKES(p.pricePerNight)} <span className="text-ink-700/60 font-normal">/ night</span></p>
                  <a href={`/dashboard/host/properties/${p.id}/availability`} onClick={(e) => e.stopPropagation()}
                    className="text-xs text-clay-500 hover:text-clay-600 mt-2 inline-block">Manage availability →</a>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming bookings */}
      <section>
        <h2 className="font-display text-2xl mb-5">Upcoming stays</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-ink-700/60">No upcoming bookings.</p>
        ) : (
          <div className="card divide-y divide-sand-400/30">
            {bookings.map((b) => (
              <div key={b.id} className="p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{b.property.title}</p>
                  <p className="text-sm text-ink-700/60 mt-0.5">
                    {b.guest.name ?? "Guest"} · {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.guests} guests
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium">{formatKES(b.total)}</p>
                  <p className="text-[0.65rem] uppercase tracking-wider mt-0.5 text-forest-800/70">{b.status.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl mb-5">Payouts</h2>
        <PayoutWidget balance={payoutBalance} phone={session.user.email ?? undefined} />
      </section>
    </div>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 eyebrow">{icon}<span>{label}</span></div>
      <p className="font-display text-3xl mt-3">{value}</p>
    </div>
  );
}
