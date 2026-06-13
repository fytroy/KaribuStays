import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatKES } from "@/lib/utils";
import { Users, Home, CreditCard, ShieldCheck } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/dashboard/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  const [userCount, propertyCount, pendingPayouts, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.payout.count({ where: { status: "PENDING" } }),
    prisma.booking.aggregate({ where: { status: "CONFIRMED" }, _sum: { total: true } }),
  ]);

  return (
    <div className="container-narrow py-12">
      <p className="eyebrow">Admin</p>
      <h1 className="display-lg mt-2 mb-10">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Kpi icon={<Users size={18} />} label="Total users" value={userCount} />
        <Kpi icon={<Home size={18} />} label="Properties" value={propertyCount} />
        <Kpi icon={<CreditCard size={18} />} label="Pending payouts" value={pendingPayouts} />
        <Kpi icon={<ShieldCheck size={18} />} label="Total revenue" value={formatKES(totalRevenue._sum.total ?? 0)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Link href="/dashboard/admin/users" className="card p-6 hover:border-forest-800/30 transition-colors">
          <Users size={24} className="mb-3 text-forest-800" />
          <h2 className="font-display text-xl">User management</h2>
          <p className="text-sm text-ink-700/60 mt-1">View all users, verify hosts, change roles</p>
        </Link>
        <Link href="/dashboard/admin/payouts" className="card p-6 hover:border-forest-800/30 transition-colors">
          <CreditCard size={24} className="mb-3 text-forest-800" />
          <h2 className="font-display text-xl">Payout requests</h2>
          <p className="text-sm text-ink-700/60 mt-1">Review and process host payout requests</p>
        </Link>
      </div>
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
