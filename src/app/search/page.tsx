import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/property-card";
import { SearchBar } from "@/components/search-bar";

export default async function SearchPage({ searchParams }: { searchParams: { city?: string; type?: string; guests?: string } }) {
  const where: any = { status: "PUBLISHED" };
  if (searchParams.city) where.city = { contains: searchParams.city, mode: "insensitive" };
  if (searchParams.type) where.type = searchParams.type.toUpperCase();
  if (searchParams.guests) where.maxGuests = { gte: Number(searchParams.guests) };

  const results = await prisma.property.findMany({
    where, orderBy: { createdAt: "desc" },
    include: { images: { take: 1, orderBy: { order: "asc" } } },
  }).catch(() => []);

  return (
    <>
      <section className="bg-cream-200/40 border-b border-sand-400/30">
        <div className="container-narrow py-8"><SearchBar /></div>
      </section>
      <section className="container-narrow py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="eyebrow">Results</p>
            <h1 className="font-display text-3xl mt-2">{searchParams.city ? `Stays in ${searchParams.city}` : "All stays"}</h1>
            <p className="text-sm text-ink-700/60 mt-1">{results.length} {results.length === 1 ? "place" : "places"}</p>
          </div>
        </div>
        {results.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-sand-400/40 rounded-xl">
            <p className="font-display text-2xl">No stays yet for this search.</p>
            <p className="mt-2 text-sm text-ink-700/60">Try adjusting your filters or browse all stays.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {results.map((p) => (
              <PropertyCard key={p.id} id={p.id} slug={p.slug} title={p.title} city={p.city} county={p.county}
                pricePerNight={p.pricePerNight} type={p.type}
                imageUrl={p.images[0]?.url ?? "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800"} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
