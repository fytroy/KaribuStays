import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  cleanliness: z.number().int().min(1).max(5).optional(),
  accuracy: z.number().int().min(1).max(5).optional(),
  location: z.number().int().min(1).max(5).optional(),
  value: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10).max(2000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let data;
  try { data = schema.parse(await req.json()); }
  catch (e: any) { return NextResponse.json({ error: "Invalid input", details: e.errors }, { status: 400 }); }

  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { review: { select: { id: true } } },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.guestId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.status !== "CONFIRMED") return NextResponse.json({ error: "Only confirmed stays can be reviewed" }, { status: 400 });
  if (new Date(booking.checkOut) > new Date()) return NextResponse.json({ error: "Stay has not ended yet" }, { status: 400 });
  if (booking.review) return NextResponse.json({ error: "Review already submitted" }, { status: 409 });

  const review = await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      propertyId: booking.propertyId,
      guestId: session.user.id,
      rating: data.rating,
      cleanliness: data.cleanliness,
      accuracy: data.accuracy,
      location: data.location,
      value: data.value,
      comment: data.comment,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
