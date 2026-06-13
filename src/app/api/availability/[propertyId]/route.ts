import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ propertyId: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { propertyId } = await params;

  const availability = await prisma.availability.findMany({
    where: { propertyId },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(availability);
}

const schema = z.object({
  dates: z.array(z.string()),
  isBlocked: z.boolean(),
});

export async function POST(req: Request, { params }: Props) {
  const { propertyId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (property.hostId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let data;
  try { data = schema.parse(await req.json()); }
  catch (e: any) { return NextResponse.json({ error: "Invalid input" }, { status: 400 }); }

  await prisma.$transaction(
    data.dates.map((dateStr) =>
      prisma.availability.upsert({
        where: { propertyId_date: { propertyId, date: new Date(dateStr) } },
        create: { propertyId, date: new Date(dateStr), isBlocked: data.isBlocked },
        update: { isBlocked: data.isBlocked },
      })
    )
  );

  return NextResponse.json({ ok: true, updated: data.dates.length });
}
