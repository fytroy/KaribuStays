import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const threads = await prisma.messageThread.findMany({
    where: { participants: { some: { id: session.user.id } } },
    include: {
      participants: { select: { id: true, name: true, image: true } },
      property: { select: { id: true, title: true, slug: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(threads);
}

const schema = z.object({
  recipientId: z.string(),
  propertyId: z.string().optional(),
  body: z.string().min(1).max(5000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let data;
  try { data = schema.parse(await req.json()); }
  catch (e: any) { return NextResponse.json({ error: "Invalid input" }, { status: 400 }); }

  if (data.recipientId === session.user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  let thread = await prisma.messageThread.findFirst({
    where: {
      propertyId: data.propertyId ?? null,
      AND: [
        { participants: { some: { id: session.user.id } } },
        { participants: { some: { id: data.recipientId } } },
      ],
    },
  });

  if (!thread) {
    thread = await prisma.messageThread.create({
      data: {
        propertyId: data.propertyId,
        participants: { connect: [{ id: session.user.id }, { id: data.recipientId }] },
      },
    });
  }

  const message = await prisma.message.create({
    data: { threadId: thread.id, senderId: session.user.id, body: data.body },
  });

  await prisma.messageThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ thread, message }, { status: 201 });
}
