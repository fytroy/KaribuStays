import Link from "next/link";
import Image from "next/image";
import { formatKES } from "@/lib/utils";

interface PropertyCardProps {
  id: string; slug: string; title: string; city: string; county: string;
  pricePerNight: number; imageUrl: string; type?: string;
  rating?: number; reviewCount?: number;
}

export function PropertyCard({ slug, title, city, county, pricePerNight, imageUrl, type, rating, reviewCount }: PropertyCardProps) {
  return (
    <Link href={`/properties/${slug}`} className="group block zoom-hover">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-sand-400/20">
        <Image src={imageUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        {type && (
          <span className="absolute left-3 top-3 rounded-full bg-cream-100/90 px-3 py-1 text-[0.65rem] uppercase tracking-wider text-ink-900 font-medium">
            {type.replaceAll("_", " ").toLowerCase()}
          </span>
        )}
      </div>
      <div className="mt-3 flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{county}</p>
          <h3 className="font-display text-xl leading-tight truncate group-hover:text-clay-500 transition-colors">{title}</h3>
          <p className="text-sm text-ink-700/70 mt-0.5">{city}</p>
        </div>
        {rating !== undefined && (
          <div className="text-right shrink-0">
            <p className="text-sm font-medium">★ {rating.toFixed(1)}</p>
            {reviewCount !== undefined && <p className="text-xs text-ink-700/60">{reviewCount}</p>}
          </div>
        )}
      </div>
      <p className="mt-1.5 text-sm">
        <span className="font-medium">{formatKES(pricePerNight)}</span>
        <span className="text-ink-700/60"> · per night</span>
      </p>
    </Link>
  );
}
