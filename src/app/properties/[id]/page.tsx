import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingWidget } from "@/components/booking-widget";
import { MapPin, Users, Bed, Bath, Star } from "lucide-react";

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { slug: params.id },
    include: {
      images: { orderBy: { order: "asc" } },
      host: { select: { id: true, name: true, image: true, isHostVerified: true, createdAt: true } },
      amenities: { include: { amenity: true } },
      reviews: { take: 6, orderBy: { createdAt: "desc" }, include: { guest: { select: { name: true, image: true } } } },
      _count: { select: { reviews: true } },
    },
  }).catch(() => null);

  if (!property) return notFound();

  const avgRating = property.reviews.length > 0
    ? property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length : null;
  const heroImage = property.images[0]?.url ?? "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600";
  const sideImages = property.images.slice(1, 5);

  return (
    <article className="container-narrow py-10">
      <header className="mb-6">
        <p className="eyebrow">{property.county}, {property.country}</p>
        <h1 className="display-lg mt-2">{property.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-700/70">
          {avgRating !== null && (
            <span className="inline-flex items-center gap-1">
              <Star size={14} className="fill-clay-500 text-clay-500" />
              <span className="font-medium text-ink-900">{avgRating.toFixed(2)}</span>
              <span>· {property._count.reviews} reviews</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1"><MapPin size={14} /> {property.city}</span>
        </div>
      </header>

      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden aspect-[2/1]">
        <div className="col-span-2 row-span-2 relative">
          <Image src={heroImage} alt={property.title} fill priority className="object-cover" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => {
          const img = sideImages[i];
          return (
            <div key={i} className="relative bg-sand-400/20">
              {img && <Image src={img.url} alt={img.alt ?? property.title} fill className="object-cover" />}
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex justify-between items-start hairline pb-6">
            <div>
              <h2 className="font-display text-2xl">
                {property.type.replaceAll("_", " ").toLowerCase()} hosted by {property.host.name?.split(" ")[0] ?? "Host"}
              </h2>
              <div className="mt-2 flex gap-4 text-sm text-ink-700/70">
                <span className="inline-flex items-center gap-1"><Users size={14} /> {property.maxGuests} guests</span>
                <span className="inline-flex items-center gap-1"><Bed size={14} /> {property.bedrooms} bedrooms</span>
                <span className="inline-flex items-center gap-1"><Bath size={14} /> {property.bathrooms} baths</span>
              </div>
            </div>
            {property.host.image && (
              <Image src={property.host.image} alt={property.host.name ?? "Host"} width={48} height={48} className="rounded-full object-cover" />
            )}
          </div>

          <div className="hairline pb-8">
            <p className="whitespace-pre-line leading-relaxed text-ink-700">{property.description}</p>
          </div>

          {property.amenities.length > 0 && (
            <div className="hairline pb-8">
              <h3 className="font-display text-2xl mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {property.amenities.map((a) => (
                  <div key={a.amenityId} className="flex items-center gap-2 py-1.5">
                    <span className="text-clay-500">●</span> {a.amenity.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {property.reviews.length > 0 && (
            <div>
              <h3 className="font-display text-2xl mb-4">
                {avgRating !== null && (
                  <span className="inline-flex items-center gap-2">
                    <Star size={20} className="fill-clay-500 text-clay-500" />
                    {avgRating.toFixed(2)} · {property._count.reviews} reviews
                  </span>
                )}
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                {property.reviews.map((r) => (
                  <div key={r.id}>
                    <div className="flex items-center gap-3 mb-2">
                      {r.guest.image && <Image src={r.guest.image} alt="" width={36} height={36} className="rounded-full" />}
                      <div>
                        <p className="font-medium text-sm">{r.guest.name ?? "Guest"}</p>
                        <p className="text-xs text-ink-700/60">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-4">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingWidget propertyId={property.id} pricePerNight={property.pricePerNight}
              cleaningFee={property.cleaningFee} maxGuests={property.maxGuests}
              minNights={property.minNights} currency={property.currency} />
          </div>
        </aside>
      </div>
    </article>
  );
}
