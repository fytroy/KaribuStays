/**
 * M-Pesa Daraja callback endpoint.
 * Safaricom POSTs the STK Push result here after the customer confirms or rejects.
 *
 * In dev, use ngrok and set MPESA_CALLBACK_URL accordingly.
 * Always responds 200 OK so Daraja doesn't retry.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseSTKCallback, type STKCallbackBody } from "@/lib/mpesa";

export async function POST(req: Request) {
  let body: STKCallbackBody;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }); }

  console.log("[M-Pesa Callback]", JSON.stringify(body));

  try {
    const cb = parseSTKCallback(body);
    const payment = await prisma.payment.findUnique({ where: { checkoutRequestId: cb.checkoutRequestId } });
    if (!payment) {
      console.warn("Payment not found for checkoutRequestId:", cb.checkoutRequestId);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (cb.resultCode === 0) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            mpesaReceiptNumber: cb.mpesaReceiptNumber,
            resultCode: cb.resultCode,
            resultDesc: cb.resultDesc,
            rawCallback: JSON.stringify(body),
          },
        }),
        prisma.booking.update({ where: { id: payment.bookingId }, data: { status: "CONFIRMED" } }),
      ]);
      // TODO: send Resend emails to guest + host
    } else {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            resultCode: cb.resultCode,
            resultDesc: cb.resultDesc,
            rawCallback: JSON.stringify(body),
          },
        }),
        prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CANCELLED", cancelReason: cb.resultDesc },
        }),
      ]);
    }
  } catch (err) {
    console.error("[M-Pesa Callback] Failed:", err);
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "M-Pesa callback endpoint" });
}
