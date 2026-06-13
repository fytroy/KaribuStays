import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initiateSTKPush, normalizeMpesaPhone } from "@/lib/mpesa";
import { fromCents } from "@/lib/utils";

const schema = z.object({ bookingId: z.string(), phone: z.string() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let data;
  try { data = schema.parse(await req.json()); }
  catch (e: any) { return NextResponse.json({ error: "Invalid input" }, { status: 400 }); }

  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { property: true },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.guestId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.status !== "PENDING") return NextResponse.json({ error: "Booking is not pending payment" }, { status: 400 });

  let phone: string;
  try { phone = normalizeMpesaPhone(data.phone); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }

  const amountKES = Math.ceil(fromCents(booking.total));

  try {
    const stk = await initiateSTKPush({
      phone, amount: amountKES,
      reference: booking.reference.slice(0, 12),
      description: "Karibu Stay",
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        method: "MPESA",
        status: "PROCESSING",
        amount: booking.total,
        currency: booking.currency,
        mpesaPhone: phone,
        merchantRequestId: stk.MerchantRequestID,
        checkoutRequestId: stk.CheckoutRequestID,
      },
    });

    return NextResponse.json({
      ok: true, message: stk.CustomerMessage, checkoutRequestId: stk.CheckoutRequestID,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
