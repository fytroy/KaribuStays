import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nightsBetween, calcBookingTotals } from "@/lib/utils";

const createSchema = z.object({
  propertyId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number().int().min(1).max(20),
  guestNote: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let data;
  try { data = createSchema.parse(await req.json()); }
  catch (e: any) { return NextResponse.json({ error: "Invalid input", details: e.errors }, { status: 400 }); }

  const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
  if (!property || property.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Property not available" }, { status: 404 });
  }

  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  if (checkIn >= checkOut) return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < property.minNights) return NextResponse.json({ error: `Minimum stay is ${property.minNights} nights` }, { status: 400 });
  if (data.guests > property.maxGuests) return NextResponse.json({ error: `Maximum ${property.maxGuests} guests allowed` }, { status: 400 });

  const overlap = await prisma.booking.findFirst({
    where: {
      propertyId: property.id,
      status: { in: ["CONFIRMED", "PENDING"] },
      AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
    },
  });
  if (overlap) return NextResponse.json({ error: "Selected dates are not available" }, { status: 409 });

  const totals = calcBookingTotals(property.pricePerNight, property.cleaningFee, nights);

  const booking = await prisma.booking.create({
    data: {
      propertyId: property.id,
      guestId: session.user.id,
      checkIn, checkOut,
      guests: data.guests,
      nights,
      subtotal: totals.subtotal,
      cleaningFee: totals.cleaningFee,
      serviceFee: totals.serviceFee,
      total: totals.total,
      currency: property.currency,
      guestNote: data.guestNote,
      status: "PENDING",
    },
  });

  return NextResponse.json(booking, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bookings = await prisma.booking.findMany({
    where: { guestId: session.user.id },
    include: { property: { include: { images: { take: 1 } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bookings);
}
