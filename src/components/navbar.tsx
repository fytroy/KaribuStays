import Link from "next/link";
import { auth } from "@/lib/auth";

export async function Navbar() {
  const session = await auth().catch(() => null);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 bg-cream-100/85 backdrop-blur-md border-b border-sand-400/30">
      <div className="container-narrow flex h-16 items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-tight">karibu</span>
          <span className="font-display text-2xl text-clay-500 tracking-tight italic">stays</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/search" className="hover:text-clay-500 transition-colors">Browse</Link>
          <Link href="/search?type=cottage" className="hover:text-clay-500 transition-colors">Cottages</Link>
          <Link href="/search?type=villa" className="hover:text-clay-500 transition-colors">Villas</Link>
          <Link href="/messages" className="hover:text-clay-500 transition-colors">Messages</Link>
          <Link href="/dashboard/host/properties/new" className="hover:text-clay-500 transition-colors">List your place</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href={user.role === "HOST" ? "/dashboard/host" : "/dashboard/guest"} className="btn-primary !px-4 !py-2 text-xs">
              {user.role === "HOST" ? "Host dashboard" : "My trips"}
            </Link>
          ) : (
            <>
              <Link href="/signin" className="text-sm hover:text-clay-500">Sign in</Link>
              <Link href="/signup" className="btn-primary !px-4 !py-2 text-xs">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
