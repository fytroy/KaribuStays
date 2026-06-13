import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AvailabilityCalendar } from "./availability-calendar";

export default async function PropertyAvailabilityPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { availability: { orderBy: { date: "asc" } } },
  });

  if (!property || property.hostId !== session.user.id) return notFound();

  const blockedDates = property.availability
    .filter((a) => a.isBlocked)
    .map((a) => a.date.toISOString().split("T")[0]);

  return (
    <div className="container-narrow py-12 max-w-2xl">
      <p className="eyebrow">Manage property</p>
      <h1 className="display-lg mt-2 mb-2">{property.title}</h1>
      <p className="text-sm text-ink-700/60 mb-10">Click dates to block or unblock them.</p>
      <AvailabilityCalendar propertyId={property.id} initialBlocked={blockedDates} />
    </div>
  );
}
