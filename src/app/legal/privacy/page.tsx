export const metadata = { title: "Privacy Policy — Karibu Stays" };

export default function PrivacyPage() {
  return (
    <div className="container-narrow py-20 max-w-2xl">
      <p className="eyebrow">Legal</p>
      <h1 className="display-lg mt-2 mb-10">Privacy Policy</h1>
      <p className="text-sm text-ink-700/60 mb-8">Last updated: June 2025</p>

      {[
        {
          title: "Data we collect",
          body: "We collect your name, email address, phone number, and payment information when you register or make a booking. We also collect usage data to improve the platform.",
        },
        {
          title: "How we use your data",
          body: "We use your data to facilitate bookings, process M-Pesa payments, send booking confirmations, and improve our service. We do not sell your data to third parties.",
        },
        {
          title: "Data sharing",
          body: "Your name and profile photo are shared with hosts when you make a booking, and with guests when you list a property. Payment details are processed securely by Safaricom and are never stored on our servers.",
        },
        {
          title: "Data retention",
          body: "We retain your account data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting support.",
        },
        {
          title: "Cookies",
          body: "We use session cookies for authentication. We do not use tracking or advertising cookies.",
        },
        {
          title: "Contact",
          body: "For privacy enquiries, email privacy@karibustays.co.ke.",
        },
      ].map(({ title, body }) => (
        <section key={title} className="hairline pb-8 mb-8">
          <h2 className="font-display text-xl mb-2">{title}</h2>
          <p className="text-ink-700/80 leading-relaxed">{body}</p>
        </section>
      ))}
    </div>
  );
}
