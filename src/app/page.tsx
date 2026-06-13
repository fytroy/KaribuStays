import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { PropertyCard } from "@/components/property-card";
import { prisma } from "@/lib/prisma";
import { ArrowUpRight } from "lucide-react";

const DEMO_LISTINGS = [
  { id: "1", slug: "demo-1", title: "Cliff House on the Indian Ocean", city: "Watamu", county: "Kilifi", pricePerNight: 1850000, type: "VILLA", imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", rating: 4.92, reviewCount: 47 },
  { id: "2", slug: "demo-2", title: "The Acacia Cottage", city: "Naivasha", county: "Nakuru", pricePerNight: 750000, type: "COTTAGE", imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80", rating: 4.86, reviewCount: 28 },
  { id: "3", slug: "demo-3", title: "Loft in Westlands", city: "Nairobi", county: "Nairobi", pricePerNight: 620000, type: "APARTMENT", imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", rating: 4.78, reviewCount: 112 },
  { id: "4", slug: "demo-4", title: "Farmhouse with Mountain View", city: "Nanyuki", county: "Laikipia", pricePerNight: 920000, type: "ENTIRE_PLACE", imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80", rating: 4.95, reviewCount: 19 },
];

const DESTINATIONS = ["Nairobi", "Diani", "Watamu", "Lamu", "Naivasha", "Nanyuki", "Karen", "Kilifi", "Malindi", "Mombasa", "Maasai Mara", "Tsavo"];

export default async function HomePage() {
  const dbListings = await prisma.property.findMany({
    where: { status: "PUBLISHED" }, take: 8, orderBy: { createdAt: "desc" },
    include: { images: { take: 1, orderBy: { order: "asc" } } },
  }).catch(() => []);

  const listings = dbListings.length > 0
    ? dbListings.map((p) => ({
        id: p.id, slug: p.slug, title: p.title, city: p.city, county: p.county,
        pricePerNight: p.pricePerNight, type: p.type,
        imageUrl: p.images[0]?.url ?? DEMO_LISTINGS[0].imageUrl,
      }))
    : DEMO_LISTINGS;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="container-narrow pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7 animate-fade-up">
              <p className="eyebrow">A Kenyan stay, on your terms</p>
              <h1 className="display-xl mt-4 text-ink-900">
                Homes worth the<br />
                <span className="italic text-clay-500">long way</span> there.
              </h1>
              <p className="mt-6 max-w-md text-lg text-ink-700/80 leading-relaxed">
                Independent cottages, villas and apartments — vetted, photographed and bookable in three taps. Pay with M-Pesa.
              </p>
            </div>
            <div className="md:col-span-5 relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&q=80" alt="Coastal home in Watamu" fill priority className="object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-cream-100 px-4 py-3 rounded-lg shadow-lg shadow-forest-900/10 hidden md:block">
                <p className="eyebrow">Watamu, Kilifi</p>
                <p className="font-display text-lg mt-1">Cliff House</p>
              </div>
            </div>
          </div>
          <div className="mt-16 md:mt-20"><SearchBar /></div>
        </div>
      </section>

      <section className="border-y border-sand-400/30 bg-cream-200/40 overflow-hidden">
        <div className="flex animate-marquee gap-12 py-5 whitespace-nowrap">
          {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => (
            <span key={i} className="font-display text-2xl tracking-tight">
              {d} <span className="text-clay-500 mx-2">✦</span>
            </span>
          ))}
        </div>
      </section>

      <section className="container-narrow py-20 md:py-28">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="eyebrow">Recently added</p>
            <h2 className="display-lg mt-2">Stay somewhere with a story.</h2>
          </div>
          <Link href="/search" className="hidden md:inline-flex items-center gap-1.5 text-sm hover:text-clay-500">
            View all <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {listings.slice(0, 8).map((p) => <PropertyCard key={p.id} {...p} />)}
        </div>
      </section>

      <section className="bg-forest-800 text-cream-100">
        <div className="container-narrow py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow !text-clay-400">Become a host</p>
            <h2 className="display-lg mt-3 text-cream-50">
              Turn your second home<br />
              <span className="italic">into something more.</span>
            </h2>
            <p className="mt-6 max-w-md text-cream-200/80 leading-relaxed">
              List in under 15 minutes. Get paid out weekly to your M-Pesa or bank. Keep your own calendar.
            </p>
            <Link href="/dashboard/host/properties/new" className="btn-accent mt-8">
              List your property <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Avg. monthly revenue" value="KES 84k" />
            <Stat label="Avg. booking" value="3.2 nights" />
            <Stat label="Host satisfaction" value="4.9 / 5" />
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-cream-200/15 rounded-xl p-4 text-center">
      <p className="font-display text-2xl text-clay-400">{value}</p>
      <p className="text-[0.65rem] uppercase tracking-wider mt-1 text-cream-200/60">{label}</p>
    </div>
  );
}
