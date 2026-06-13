import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRow } from "./user-row";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  if (session.user.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      isHostVerified: true, emailVerified: true, createdAt: true,
      _count: { select: { properties: true, bookings: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="container-narrow py-12">
      <p className="eyebrow">Admin</p>
      <h1 className="display-lg mt-2 mb-10">Users ({users.length})</h1>
      <div className="card divide-y divide-sand-400/20">
        {users.map((u) => <UserRow key={u.id} user={u} />)}
      </div>
    </div>
  );
}
