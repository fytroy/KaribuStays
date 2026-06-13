import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.email) return NextResponse.json({ error: "No email on account" }, { status: 400 });
  if (user.emailVerified) return NextResponse.json({ message: "Already verified" });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier: user.email } });
  await prisma.verificationToken.create({ data: { identifier: user.email, token, expires } });

  if (process.env.RESEND_API_KEY) {
    await sendVerificationEmail(user.email, token);
  }

  return NextResponse.json({ ok: true });
}
