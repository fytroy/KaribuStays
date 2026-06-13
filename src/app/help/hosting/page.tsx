import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function HostingGuidePage() {
  return (
    <div className="container-narrow py-20 max-w-2xl">
      <p className="eyebrow">For hosts</p>
      <h1 className="display-lg mt-2 mb-10">Hosting guide</h1>

      <div className="space-y-10">
        {[
          {
            title: "List in 15 minutes",
            body: "Add your property details, upload photos, set your price and minimum stay. Once published, guests can book immediately.",
          },
          {
            title: "Set your own calendar",
            body: "Block off dates when your property is unavailable — family visits, maintenance, or your own holidays. You're always in control.",
          },
          {
            title: "Guest vetting",
            body: "All guests must create a verified account before booking. You'll see their name and profile before confirming any stay.",
          },
          {
            title: "Cancellation policy",
            body: "Karibu Stays uses a moderate cancellation policy: guests get a full refund if they cancel more than 5 days before check-in.",
          },
          {
            title: "Support",
            body: "Our host support team is available 7 days a week. Reach us via the contact page or in-app messaging.",
          },
        ].map(({ title, body }) => (
          <section key={title} className="hairline pb-8">
            <h2 className="font-display text-2xl mb-3">{title}</h2>
            <p className="text-ink-700/80 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>

      <Link href="/dashboard/host/properties/new" className="btn-accent mt-10 inline-flex">
        List your property <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
