import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 503 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "karibu-stays";
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHmac("sha256", apiSecret)
    .update(paramsToSign)
    .digest("hex");

  return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder });
}
