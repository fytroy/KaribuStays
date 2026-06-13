# Karibu Stays — BnB Marketplace MVP

A production-quality starter for a Kenyan BnB marketplace. Built with **Next.js 14 (App Router)**, **TypeScript**, **Prisma + PostgreSQL**, **NextAuth v5**, **Tailwind CSS**, and a working **M-Pesa Daraja** integration (STK Push).

The aesthetic is intentionally editorial — warm cream backgrounds, Fraunces serif display, deep forest + terracotta accents — to feel rooted, not generic Silicon Valley.

---

## What works out of the box

- 🏡 **Public listings** — landing, search, filterable browse, property detail with gallery
- 🔐 **Auth** — email/password + Google OAuth (NextAuth v5, JWT sessions)
- 👤 **Two roles** — Guest and Host, with separate dashboards
- 📅 **Booking flow** — date pick → totals math → reservation → M-Pesa STK push → callback updates booking to CONFIRMED
- 💰 **M-Pesa Daraja integration** — full STK push, callback handling, status polling (sandbox + production)
- 🛏 **Host workflow** — create listings, view properties, see upcoming bookings, KPI overview
- 🌱 **Seeded demo data** — 4 listings, host + guest accounts

## What's stubbed (the next milestones)

- 📷 **Image uploads** — currently you paste URLs; wire Cloudinary using `NEXT_PUBLIC_CLOUDINARY_*` env vars
- 💬 **Messaging** — schema is ready (`MessageThread` + `Message`); UI not built
- ⭐ **Reviews UI** — schema ready; needs post-stay form
- 📧 **Transactional emails** — set `RESEND_API_KEY` and add send calls inside `/api/mpesa/callback`
- 💳 **Pesapal / Flutterwave** — drop-in alternatives; wrappers can mirror `lib/mpesa.ts`
- 🏦 **Host payouts** — manual for MVP; later integrate B2C disbursement or M-Pesa for Business
- 🗺 **Maps** — add Mapbox or Google Maps on property detail (lat/lng already on Property)

---

## Quick start

```bash
# 1. Install
npm install

# 2. Set env
cp .env.example .env
# edit .env (DATABASE_URL, AUTH_SECRET, MPESA_*)

# 3. Set up the DB
npm run db:push
npm run db:seed

# 4. Run
npm run dev
```

Open <http://localhost:3000>.

Demo accounts (after seeding):
- **Host** — `amani@karibustays.co.ke` / `password123`
- **Guest** — `njeri@example.com` / `password123`

---

## Setting up M-Pesa Daraja

1. **Get sandbox credentials** at <https://developer.safaricom.co.ke>.
   - Create an app under "My Apps" → enable "Lipa Na M-Pesa Online".
   - Copy `Consumer Key` and `Consumer Secret`.
   - From the "Test Credentials" page, get the `Lipa Na M-Pesa Online Passkey` and the test shortcode (usually `174379`).

2. **Expose your localhost** so Daraja can reach your callback:
   ```bash
   ngrok http 3000
   ```
   Copy the HTTPS URL (e.g. `https://ab12-41-90.ngrok-free.app`).

3. **Fill `.env`**:
   ```
   MPESA_ENV="sandbox"
   MPESA_CONSUMER_KEY="..."
   MPESA_CONSUMER_SECRET="..."
   MPESA_SHORTCODE="174379"
   MPESA_PASSKEY="..."
   MPESA_CALLBACK_URL="https://ab12-41-90.ngrok-free.app/api/mpesa/callback"
   ```

4. **Test phone numbers** (sandbox accepts these):
   - Safaricom provides `254708374149` for sandbox tests.
   - In production, any real Safaricom number works.

5. **Going to production**:
   - Apply for a "Go Live" approval from Safaricom (takes a few days).
   - Switch `MPESA_ENV` to `"production"`, swap creds, and use your real PayBill or Till shortcode.
   - The callback URL must be HTTPS on a public domain.

---

## Architecture map

```
src/
├── app/
│   ├── (auth)/                  signin, signup pages
│   ├── api/
│   │   ├── auth/[...nextauth]   NextAuth handlers
│   │   ├── bookings/            create + list + by id
│   │   ├── mpesa/
│   │   │   ├── stkpush/         initiates STK push
│   │   │   └── callback/        Safaricom POSTs result here
│   │   ├── properties/          host create + public list
│   │   └── register/            user signup
│   ├── book/[id]/               checkout + M-Pesa flow
│   ├── dashboard/
│   │   ├── host/                host overview + new listing form
│   │   └── guest/               my trips
│   ├── properties/[slug]/       property detail
│   ├── search/                  browse / filter
│   ├── page.tsx                 landing
│   └── layout.tsx
├── components/                  navbar, footer, search-bar, property-card, booking-widget
├── lib/
│   ├── prisma.ts                singleton client
│   ├── auth.ts                  NextAuth v5 config
│   ├── mpesa.ts                 Daraja API client (token cache, STK push, callback parser)
│   └── utils.ts                 money helpers, date math, slugify
└── middleware.ts                protects /dashboard and /book
```

### Data model highlights

- **Money is stored as integer cents** (KES * 100) to avoid float bugs. All UI helpers (`formatKES`, `calcBookingTotals`) handle the conversion.
- **Bookings stay PENDING** until the M-Pesa callback flips them to CONFIRMED (or CANCELLED on failure).
- **Date overlap is enforced** in the create-booking handler — both confirmed and pending bookings hold dates.
- **`Availability`** lets hosts block specific dates or override per-night pricing.

---

## Deploy

**Vercel + Neon** is the smoothest path:

1. Push to GitHub.
2. Create a Postgres DB on [Neon](https://neon.tech) (free tier works).
3. Import the repo into Vercel; paste env vars; deploy.
4. Run `npx prisma migrate deploy && npx prisma db seed` from a local shell pointed at the production DB, or use a Vercel build hook.
5. Set `MPESA_CALLBACK_URL` to `https://yourdomain.vercel.app/api/mpesa/callback`.

---

## Roadmap (priority order)

1. **Image upload widget** — Cloudinary signed uploads on the new-property form.
2. **Calendar / availability UI** — block dates, set seasonal pricing.
3. **Messaging** — wire `/dashboard/inbox` to the `MessageThread` schema.
4. **Reviews** — post-stay review form; aggregate ratings on property cards.
5. **Email** — Resend integration in the M-Pesa callback (booking confirmation + host notification).
6. **Admin panel** — at `/dashboard/admin` for moderation, payouts.
7. **Host payouts** — weekly batch disbursement via M-Pesa B2C.
8. **Search v2** — map view (Mapbox), price range slider, amenity facets.
9. **i18n** — Swahili (`sw`) alongside English.
10. **Mobile app** — the API is already JSON-clean; React Native shell on top.

---

## License

MIT — yours to ship.
