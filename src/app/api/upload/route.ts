import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/protect";

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const CF_API_TOKEN = process.env.CF_API_TOKEN!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;
const BUCKET = "goldaxis-images";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Only image files allowed" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const key = `commerces/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = await file.arrayBuffer();

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${BUCKET}/objects/${key}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": file.type,
      },
      body: buffer,
    }
  );

  if (!res.ok) {
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }

  const url = `${R2_PUBLIC_URL}/${key}`;
  return Response.json({ url });
}
