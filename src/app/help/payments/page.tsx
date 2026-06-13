export default function PaymentsHelpPage() {
  return (
    <div className="container-narrow py-20 max-w-2xl">
      <p className="eyebrow">For hosts</p>
      <h1 className="display-lg mt-2 mb-10">M-Pesa payouts</h1>

      <div className="space-y-10">
        {[
          {
            title: "How earnings work",
            body: "When a guest completes a stay, the booking total is added to your available balance. Service fees (8 %) are deducted before you receive funds.",
          },
          {
            title: "Requesting a payout",
            body: "Go to your Host Dashboard → Payouts section. Enter the amount you want to withdraw and your registered M-Pesa number. Minimum payout is KES 1.",
          },
          {
            title: "Processing time",
            body: "Payout requests are processed within 1–2 business days Monday to Friday. Requests made after 3 pm EAT are processed the next business day.",
          },
          {
            title: "Bank transfers",
            body: "Bank transfers (RTGS) are available for amounts above KES 50,000. Contact support to enable this option on your account.",
          },
          {
            title: "Tax",
            body: "Karibu Stays does not withhold tax on your behalf. As a host, you are responsible for declaring rental income under Kenyan tax law. Consult a tax professional for guidance.",
          },
        ].map(({ title, body }) => (
          <section key={title} className="hairline pb-8">
            <h2 className="font-display text-2xl mb-3">{title}</h2>
            <p className="text-ink-700/80 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
