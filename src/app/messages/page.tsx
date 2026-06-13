import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/messages");

  const threads = await prisma.messageThread.findMany({
    where: { participants: { some: { id: session.user.id } } },
    include: {
      participants: { select: { id: true, name: true, image: true } },
      property: { select: { id: true, title: true, slug: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { name: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="container-narrow py-12 max-w-2xl">
      <p className="eyebrow">Inbox</p>
      <h1 className="display-lg mt-2 mb-10">Messages</h1>

      {threads.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-xl">No messages yet.</p>
          <p className="text-sm text-ink-700/60 mt-2">Contact a host from any property page.</p>
        </div>
      ) : (
        <div className="card divide-y divide-sand-400/20">
          {threads.map((t) => {
            const other = t.participants.find((p) => p.id !== session.user.id);
            const last = t.messages[0];
            return (
              <Link key={t.id} href={`/messages/${t.id}`} className="flex items-center gap-4 p-4 hover:bg-cream-200/50 transition-colors">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-sand-400/20 shrink-0">
                  {other?.image && <Image src={other.image} alt="" fill className="object-cover" />}
                  {!other?.image && (
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-ink-700/60">
                      {other?.name?.[0] ?? "?"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{other?.name ?? "Unknown"}</p>
                  {t.property && <p className="text-xs text-ink-700/60 truncate">{t.property.title}</p>}
                  {last && (
                    <p className="text-sm text-ink-700/60 truncate mt-0.5">
                      {last.sender.name?.split(" ")[0]}: {last.body}
                    </p>
                  )}
                </div>
                <p className="text-xs text-ink-700/40 shrink-0">
                  {last ? new Date(last.createdAt).toLocaleDateString() : ""}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
