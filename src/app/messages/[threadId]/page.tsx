import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageInput } from "./message-input";

export default async function ThreadPage({ params }: { params: { threadId: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/messages");

  const thread = await prisma.messageThread.findUnique({
    where: { id: params.threadId },
    include: {
      participants: { select: { id: true, name: true, image: true } },
      property: { select: { id: true, title: true, slug: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  if (!thread) return notFound();
  if (!thread.participants.some((p) => p.id === session.user.id)) return notFound();

  await prisma.message.updateMany({
    where: { threadId: thread.id, readAt: null, senderId: { not: session.user.id } },
    data: { readAt: new Date() },
  });

  const other = thread.participants.find((p) => p.id !== session.user.id);

  return (
    <div className="container-narrow py-12 max-w-xl flex flex-col" style={{ minHeight: "calc(100vh - 200px)" }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/messages" className="text-sm text-ink-700/60 hover:text-ink-900">← Inbox</Link>
        <span className="text-ink-700/30">/</span>
        <span className="font-medium">{other?.name}</span>
        {thread.property && (
          <>
            <span className="text-ink-700/30">·</span>
            <Link href={`/properties/${thread.property.slug}`} className="text-sm text-clay-500 hover:text-clay-600 truncate">
              {thread.property.title}
            </Link>
          </>
        )}
      </div>

      <div className="flex-1 space-y-4 mb-6">
        {thread.messages.length === 0 && (
          <p className="text-sm text-ink-700/50 text-center py-10">No messages yet. Say hello!</p>
        )}
        {thread.messages.map((m) => {
          const isMine = m.sender.id === session.user.id;
          return (
            <div key={m.id} className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}>
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-sand-400/20 shrink-0 self-end">
                {m.sender.image
                  ? <Image src={m.sender.image} alt="" fill className="object-cover" />
                  : <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">{m.sender.name?.[0]}</span>
                }
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isMine ? "bg-forest-800 text-cream-100 rounded-tr-sm" : "bg-cream-200 text-ink-900 rounded-tl-sm"
              }`}>
                {m.body}
                <p className={`text-[0.65rem] mt-1 ${isMine ? "text-cream-200/60" : "text-ink-700/50"}`}>
                  {new Date(m.createdAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput threadId={thread.id} />
    </div>
  );
}
