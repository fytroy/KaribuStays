import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nightsBetween, calcBookingTotals, formatKES, formatDate } from "@/lib/utils";
import { CheckoutForm } from "./checkout-form";

export default async function BookingPage({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { checkIn?: string; checkOut?: string; guests?: string };
}) {
  const session = await auth();
  if (!session?.user) {
    const ret = encodeURIComponent(`/book/${params.id}?${new URLSearchParams(searchParams as any)}`);
    redirect(`/signin?callbackUrl=${ret}`);
  }

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { images: { take: 1, orderBy: { order: "asc" } } },
  }).catch(() => null);

  if (!property) return notFound();
  if (!searchParams.checkIn || !searchParams.checkOut) redirect(`/properties/${property.slug}`);

  const checkIn = new Date(searchParams.checkIn);
  const checkOut = new Date(searchParams.checkOut);
  const guests = Number(searchParams.guests ?? 1);
  const nights = nightsBetween(checkIn, checkOut);
  const totals = calcBookingTotals(property.pricePerNight, property.cleaningFee, nights);
  const heroImage = property.images[0]?.url ?? "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600";

  return (
    <div className="container-narrow py-12">
      <h1 className="display-lg mb-10">Confirm and pay</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <CheckoutForm propertyId={property.id} checkIn={searchParams.checkIn}
          checkOut={searchParams.checkOut} guests={guests} totalKES={totals.total / 100} />
        <aside className="lg:order-last">
          <div className="card p-6 sticky top-24">
            <div className="flex gap-4 pb-6 hairline">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                <Image src={heroImage} alt={property.title} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="eyebrow">{property.county}</p>
                <h3 className="font-display text-lg leading-tight truncate">{property.title}</h3>
                <p className="text-xs text-ink-700/60 mt-1">{property.type.replaceAll("_", " ").toLowerCase()}</p>
              </div>
            </div>
            <div className="py-6 hairline space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-700/70">Dates</span><span className="font-medium">{formatDate(checkIn)} → {formatDate(checkOut)}</span></div>
              <div className="flex justify-between"><span className="text-ink-700/70">Guests</span><span className="font-medium">{guests} {guests === 1 ? "guest" : "guests"}</span></div>
              <div className="flex justify-between"><span className="text-ink-700/70">Nights</span><span className="font-medium">{nights}</span></div>
            </div>
            <div className="pt-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-700/70">{formatKES(property.pricePerNight)} × {nights}</span><span>{formatKES(totals.subtotal)}</span></div>
              {totals.cleaningFee > 0 && <div className="flex justify-between"><span className="text-ink-700/70">Cleaning fee</span><span>{formatKES(totals.cleaningFee)}</span></div>}
              <div className="flex justify-between"><span className="text-ink-700/70">Service fee</span><span>{formatKES(totals.serviceFee)}</span></div>
              <div className="pt-3 mt-3 border-t border-sand-400/40 flex justify-between font-medium text-base"><span>Total (KES)</span><span>{formatKES(totals.total)}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
