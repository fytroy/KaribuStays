import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string(),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  let data;
  try { data = schema.parse(await req.json()); }
  catch (e: any) { return NextResponse.json({ error: "Invalid input" }, { status: 400 }); }

  const record = await prisma.verificationToken.findUnique({ where: { token: data.token } });
  if (!record || !record.identifier.startsWith("reset:")) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token: data.token } });
    return NextResponse.json({ error: "Token expired" }, { status: 400 });
  }

  const email = record.identifier.replace("reset:", "");
  const hash = await bcrypt.hash(data.password, 12);
  await prisma.user.update({ where: { email }, data: { password: hash } });
  await prisma.verificationToken.delete({ where: { token: data.token } });

  return NextResponse.json({ ok: true });
}
