import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const payouts = await prisma.payout.findMany({
    include: { host: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(payouts);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status, adminNote } = z.object({
    id: z.string(),
    status: z.enum(["PROCESSING", "PAID", "FAILED"]),
    adminNote: z.string().optional(),
  }).parse(await req.json());

  const payout = await prisma.payout.update({
    where: { id },
    data: { status, adminNote, processedAt: status === "PAID" ? new Date() : undefined },
  });
  return NextResponse.json(payout);
}
