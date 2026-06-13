import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { email } = z.object({ email: z.string().email() }).parse(await req.json());

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return 200 to prevent email enumeration
  if (!user) return NextResponse.json({ ok: true });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier: `reset:${email}` } });
  await prisma.verificationToken.create({
    data: { identifier: `reset:${email}`, token, expires },
  });

  if (process.env.RESEND_API_KEY) {
    await sendPasswordResetEmail(email, token);
  }

  return NextResponse.json({ ok: true });
}
