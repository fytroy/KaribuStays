export const metadata = { title: "Terms of Service — Karibu Stays" };

export default function TermsPage() {
  return (
    <div className="container-narrow py-20 max-w-2xl prose prose-neutral">
      <p className="eyebrow">Legal</p>
      <h1 className="display-lg mt-2 mb-10">Terms of Service</h1>
      <p className="text-sm text-ink-700/60 mb-8">Last updated: June 2025</p>

      {[
        {
          title: "1. Acceptance",
          body: "By creating an account or making a booking on Karibu Stays, you agree to these Terms. If you do not agree, do not use the platform.",
        },
        {
          title: "2. The platform",
          body: "Karibu Stays is a marketplace that connects guests with independent property hosts in Kenya. We are not a party to any rental agreement between hosts and guests.",
        },
        {
          title: "3. Bookings",
          body: "A booking is confirmed only after M-Pesa payment is received and the host accepts. Karibu Stays reserves the right to cancel bookings that violate these terms.",
        },
        {
          title: "4. Cancellations",
          body: "Guests who cancel more than 5 days before check-in receive a full refund. Cancellations within 5 days forfeit the first night. Hosts who cancel confirmed bookings may be suspended.",
        },
        {
          title: "5. Prohibited conduct",
          body: "You may not use Karibu Stays to list or book properties for illegal purposes, engage in harassment, or circumvent the payment system.",
        },
        {
          title: "6. Limitation of liability",
          body: "Karibu Stays is not liable for any loss, damage, injury, or dispute arising from a stay. All property descriptions are provided by hosts and are not independently verified.",
        },
        {
          title: "7. Governing law",
          body: "These Terms are governed by the laws of Kenya. Disputes shall be resolved by the courts of Nairobi.",
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
