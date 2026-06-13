import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatKES, formatDate } from "@/lib/utils";
import { CancelBookingButton } from "./cancel-button";

export default async function GuestDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/dashboard/guest");

  const bookings = await prisma.booking.findMany({
    where: { guestId: session.user.id },
    include: {
      property: { include: { images: { take: 1 } } },
      review: { select: { id: true } },
    },
    orderBy: { checkIn: "desc" },
  });

  const upcoming = bookings.filter((b) => new Date(b.checkOut) >= new Date() && b.status !== "CANCELLED");
  const past = bookings.filter((b) => new Date(b.checkOut) < new Date() || b.status === "CANCELLED");

  return (
    <div className="container-narrow py-12">
      <p className="eyebrow">My trips</p>
      <h1 className="display-lg mt-2 mb-10">Where you're going.</h1>

      {upcoming.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl">No upcoming trips.</p>
          <p className="text-sm text-ink-700/60 mt-2">Time to plan something.</p>
          <Link href="/search" className="btn-primary mt-6 inline-flex">Browse stays</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {upcoming.map((b) => (
            <div key={b.id} className="card overflow-hidden">
              <Link href={`/properties/${b.property.slug}`} className="flex group">
                <div className="relative w-32 h-32 shrink-0 bg-sand-400/20">
                  {b.property.images[0] && (
                    <Image src={b.property.images[0].url} alt={b.property.title} fill className="object-cover" />
                  )}
                </div>
                <div className="p-4 flex-1 min-w-0">
                  <p className="eyebrow">{b.property.county}</p>
                  <p className="font-display text-lg truncate group-hover:text-clay-500 mt-0.5">{b.property.title}</p>
                  <p className="text-sm text-ink-700/70 mt-1">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-[0.65rem] uppercase tracking-wider text-forest-800/70">{b.status.toLowerCase()}</span>
                    <span className="font-medium">{formatKES(b.total)}</span>
                  </div>
                </div>
              </Link>
              {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                <div className="border-t border-sand-400/20 px-4 py-3 flex justify-end">
                  <CancelBookingButton bookingId={b.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl mb-5">Past trips</h2>
          <div className="card divide-y divide-sand-400/30">
            {past.map((b) => (
              <div key={b.id} className="p-5 flex items-center justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{b.property.title}</p>
                  <p className="text-ink-700/60 mt-0.5">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {b.status === "CONFIRMED" && !b.review && (
                    <Link href={`/reviews/new?bookingId=${b.id}`} className="text-clay-500 hover:text-clay-600 text-xs font-medium">
                      Leave a review
                    </Link>
                  )}
                  <p className="text-ink-700/60">{b.status.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
