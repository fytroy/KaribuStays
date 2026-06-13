import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "./review-form";

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: { bookingId?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect(`/signin?callbackUrl=/reviews/new?bookingId=${searchParams.bookingId}`);

  if (!searchParams.bookingId) return notFound();

  const booking = await prisma.booking.findUnique({
    where: { id: searchParams.bookingId },
    include: { property: { include: { images: { take: 1 } } }, review: { select: { id: true } } },
  });

  if (!booking || booking.guestId !== session.user.id) return notFound();
  if (booking.status !== "CONFIRMED" || new Date(booking.checkOut) > new Date()) return notFound();
  if (booking.review) redirect("/dashboard/guest");

  return (
    <div className="container-narrow py-12 max-w-xl">
      <p className="eyebrow">Share your experience</p>
      <h1 className="display-lg mt-2 mb-2">{booking.property.title}</h1>
      <p className="text-sm text-ink-700/60 mb-10">Your review helps other travellers and rewards great hosts.</p>
      <ReviewForm bookingId={booking.id} />
    </div>
  );
}
