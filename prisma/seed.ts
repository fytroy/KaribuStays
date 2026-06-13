import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const amenities = ["Wi-Fi", "Kitchen", "Pool", "Parking", "Beach access", "Hot water", "Workspace", "Air conditioning", "TV", "Washer"];
  for (const name of amenities) {
    await prisma.amenity.upsert({ where: { name }, update: {}, create: { name } });
  }

  const hostPassword = await bcrypt.hash("password123", 12);
  const host = await prisma.user.upsert({
    where: { email: "amani@karibustays.co.ke" },
    update: {},
    create: {
      email: "amani@karibustays.co.ke", name: "Amani Kariuki", password: hostPassword, role: "HOST",
      isHostVerified: true, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      phone: "254712345678",
    },
  });

  await prisma.user.upsert({
    where: { email: "njeri@example.com" },
    update: {},
    create: {
      email: "njeri@example.com", name: "Njeri Mwangi",
      password: await bcrypt.hash("password123", 12), role: "GUEST", phone: "254722000000",
    },
  });

  const props = [
    { slug: "cliff-house-watamu", title: "Cliff House on the Indian Ocean",
      description: "A whitewashed Swahili-style retreat perched on the cliffs of Watamu. Wake up to the sound of the Indian Ocean, walk down to your private beach cove, then drift back for sundowners on the rooftop. Sleeps six across three sea-facing rooms.",
      type: "VILLA" as const, county: "Kilifi", city: "Watamu", address: "Cliff Lane",
      maxGuests: 6, bedrooms: 3, beds: 4, bathrooms: 3, pricePerNight: 1850000,
      images: [
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200",
        "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1200",
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
      ] },
    { slug: "acacia-cottage-naivasha", title: "The Acacia Cottage",
      description: "A two-bedroom timber cottage on a working farm above Lake Naivasha. Wood-burning fireplace, organic breakfast hampers on request, and resident giraffes at the gate most mornings.",
      type: "COTTAGE" as const, county: "Nakuru", city: "Naivasha", address: "Crater Road",
      maxGuests: 4, bedrooms: 2, beds: 2, bathrooms: 2, pricePerNight: 750000,
      images: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200",
        "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200",
      ] },
    { slug: "westlands-loft", title: "Loft in Westlands",
      description: "Industrial-chic loft in the heart of Westlands. High ceilings, espresso machine, fast fibre. Perfect for a working week in Nairobi with weekend breaks within reach.",
      type: "APARTMENT" as const, county: "Nairobi", city: "Nairobi", address: "Peponi Road",
      maxGuests: 2, bedrooms: 1, beds: 1, bathrooms: 1, pricePerNight: 620000,
      images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      ] },
    { slug: "nanyuki-farmhouse", title: "Farmhouse with Mountain View",
      description: "Stone-built farmhouse on the slopes of Mount Kenya. Wraparound veranda, fireplace in every room, and miles of walking from the door. Sleeps eight comfortably.",
      type: "ENTIRE_PLACE" as const, county: "Laikipia", city: "Nanyuki", address: "Timau Road",
      maxGuests: 8, bedrooms: 4, beds: 5, bathrooms: 3, pricePerNight: 920000,
      images: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      ] },
  ];

  for (const p of props) {
    const { images, ...rest } = p;
    await prisma.property.upsert({
      where: { slug: p.slug }, update: {},
      create: {
        ...rest, hostId: host.id, status: "PUBLISHED",
        images: { create: images.map((url, i) => ({ url, order: i })) },
      },
    });
  }

  console.log("✓ Seeded:", props.length, "properties, 1 host, 1 guest");
  console.log("  Host login: amani@karibustays.co.ke / password123");
  console.log("  Guest login: njeri@example.com / password123");
}

main().catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
