export const metadata = { title: "Contact — Karibu Stays" };

export default function ContactPage() {
  return (
    <div className="container-narrow py-20 max-w-xl">
      <p className="eyebrow">Get in touch</p>
      <h1 className="display-lg mt-2 mb-10">Contact us</h1>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {[
          { label: "Guest support", value: "guests@karibustays.co.ke", note: "Booking issues, refunds, general help" },
          { label: "Host support", value: "hosts@karibustays.co.ke", note: "Listing help, payouts, account queries" },
          { label: "Press", value: "press@karibustays.co.ke", note: "Media enquiries and partnerships" },
          { label: "Legal & privacy", value: "privacy@karibustays.co.ke", note: "Data requests, takedowns, compliance" },
        ].map(({ label, value, note }) => (
          <div key={label} className="card p-5">
            <p className="eyebrow mb-1">{label}</p>
            <a href={`mailto:${value}`} className="font-medium text-clay-500 hover:text-clay-600 break-all">{value}</a>
            <p className="text-xs text-ink-700/60 mt-1">{note}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-xl mb-1">Office</h2>
        <p className="text-sm text-ink-700/70 leading-relaxed">
          Karibu Stays Ltd<br />
          The Mirage Tower, Chiromo Road<br />
          Westlands, Nairobi 00100<br />
          Kenya
        </p>
      </div>
    </div>
  );
}
