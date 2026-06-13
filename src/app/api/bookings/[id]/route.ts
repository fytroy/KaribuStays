import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { property: true, payments: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = session.user.id;
  if (booking.guestId !== userId && booking.property.hostId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(booking);
}

const cancelSchema = z.object({ reason: z.string().max(500).optional() });

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { property: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = session.user.id;
  const isGuest = booking.guestId === userId;
  const isHost = booking.property.hostId === userId;
  if (!isGuest && !isHost) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
    return NextResponse.json({ error: "Booking cannot be cancelled" }, { status: 400 });
  }

  let data: { reason?: string };
  try { data = cancelSchema.parse(await req.json()); }
  catch { data = {}; }

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: {
      status: "CANCELLED",
      cancelReason: data.reason ?? (isHost ? "Cancelled by host" : "Cancelled by guest"),
    },
  });
  return NextResponse.json(updated);
}
