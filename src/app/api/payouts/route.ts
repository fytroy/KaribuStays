import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  amount: z.number().int().min(100),
  method: z.enum(["MPESA", "BANK"]).default("MPESA"),
  phone: z.string().optional(),
  bankAccount: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "HOST" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Hosts only" }, { status: 403 });
  }

  let data;
  try { data = schema.parse(await req.json()); }
  catch (e: any) { return NextResponse.json({ error: "Invalid input", details: e.errors }, { status: 400 }); }

  if (data.method === "MPESA" && !data.phone) {
    return NextResponse.json({ error: "Phone number required for M-Pesa payout" }, { status: 400 });
  }

  const available = await prisma.booking.aggregate({
    where: {
      property: { hostId: session.user.id },
      status: "CONFIRMED",
    },
    _sum: { total: true },
  });
  const paid = await prisma.payout.aggregate({
    where: { hostId: session.user.id, status: { in: ["PENDING", "PROCESSING", "PAID"] } },
    _sum: { amount: true },
  });
  const balance = (available._sum.total ?? 0) - (paid._sum.amount ?? 0);

  if (data.amount > balance) {
    return NextResponse.json({ error: `Insufficient balance. Available: ${balance}` }, { status: 400 });
  }

  const payout = await prisma.payout.create({
    data: {
      hostId: session.user.id,
      amount: data.amount,
      method: data.method,
      phone: data.phone,
      bankAccount: data.bankAccount,
      status: "PENDING",
    },
  });

  return NextResponse.json(payout, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payouts = await prisma.payout.findMany({
    where: { hostId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(payouts);
}
