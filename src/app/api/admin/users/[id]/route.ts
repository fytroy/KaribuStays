import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  role: z.enum(["GUEST", "HOST", "ADMIN"]).optional(),
  isHostVerified: z.boolean().optional(),
});

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let data;
  try { data = schema.parse(await req.json()); }
  catch (e: any) { return NextResponse.json({ error: "Invalid input" }, { status: 400 }); }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, role: true, isHostVerified: true },
  });
  return NextResponse.json(user);
}
