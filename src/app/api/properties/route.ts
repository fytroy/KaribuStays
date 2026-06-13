import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20),
  type: z.enum(["ENTIRE_PLACE", "PRIVATE_ROOM", "SHARED_ROOM", "APARTMENT", "COTTAGE", "VILLA"]),
  address: z.string().min(3),
  city: z.string().min(2),
  county: z.string().min(2),
  maxGuests: z.number().int().min(1).max(20),
  bedrooms: z.number().int().min(0),
  beds: z.number().int().min(1),
  bathrooms: z.number().min(0.5),
  pricePerNight: z.number().int().min(100),  // cents
  cleaningFee: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (role !== "HOST" && role !== "ADMIN") {
    return NextResponse.json({ error: "Hosts only" }, { status: 403 });
  }

  let data;
  try { data = schema.parse(await req.json()); }
  catch (e: any) { return NextResponse.json({ error: "Invalid input", details: e.errors }, { status: 400 }); }

  // Make unique slug
  const baseSlug = slugify(data.title);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.property.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const property = await prisma.property.create({
    data: {
      hostId: session.user.id,
      title: data.title,
      slug,
      description: data.description,
      type: data.type,
      status: "PUBLISHED",
      address: data.address,
      city: data.city,
      county: data.county,
      maxGuests: data.maxGuests,
      bedrooms: data.bedrooms,
      beds: data.beds,
      bathrooms: data.bathrooms,
      pricePerNight: data.pricePerNight,
      cleaningFee: data.cleaningFee ?? 0,
      images: data.images?.length
        ? { create: data.images.map((url, i) => ({ url, order: i })) }
        : undefined,
    },
  });

  return NextResponse.json(property, { status: 201 });
}

export async function GET() {
  const list = await prisma.property.findMany({
    where: { status: "PUBLISHED" },
    include: { images: { take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  return NextResponse.json(list);
}
