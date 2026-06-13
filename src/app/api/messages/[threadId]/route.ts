import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ threadId: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { threadId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      participants: { select: { id: true, name: true, image: true } },
      property: { select: { id: true, title: true, slug: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isParticipant = thread.participants.some((p) => p.id === session.user.id);
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.message.updateMany({
    where: { threadId, readAt: null, senderId: { not: session.user.id } },
    data: { readAt: new Date() },
  });

  return NextResponse.json(thread);
}

export async function POST(req: Request, { params }: Props) {
  const { threadId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: { participants: { select: { id: true } } },
  });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!thread.participants.some((p) => p.id === session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { body } = z.object({ body: z.string().min(1).max(5000) }).parse(await req.json());
  const message = await prisma.message.create({
    data: { threadId, senderId: session.user.id, body },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });
  await prisma.messageThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });

  return NextResponse.json(message, { status: 201 });
}
