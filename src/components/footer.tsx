import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-32 bg-forest-900 text-cream-200">
      <div className="container-narrow py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2">
            <h3 className="font-display text-3xl text-cream-100">karibu <span className="italic text-clay-400">stays</span></h3>
            <p className="mt-3 max-w-xs text-sm text-cream-200/70 leading-relaxed">
              Handpicked homes across Kenya — from cliff cottages in Watamu to highland farmhouses in Nyeri.
            </p>
          </div>
          <div>
            <p className="eyebrow !text-cream-200/50">Explore</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-clay-400">Browse stays</Link></li>
              <li><Link href="/search?city=Nairobi" className="hover:text-clay-400">Nairobi</Link></li>
              <li><Link href="/search?city=Diani" className="hover:text-clay-400">Diani</Link></li>
              <li><Link href="/search?city=Watamu" className="hover:text-clay-400">Watamu</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow !text-cream-200/50">Hosts</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/dashboard/host/properties/new" className="hover:text-clay-400">List your home</Link></li>
              <li><Link href="/help/hosting" className="hover:text-clay-400">Hosting guide</Link></li>
              <li><Link href="/help/payments" className="hover:text-clay-400">M-Pesa payouts</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-cream-200/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-cream-200/50">
          <p>© {new Date().getFullYear()} Karibu Stays. Made in Nairobi.</p>
          <div className="flex gap-6">
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
