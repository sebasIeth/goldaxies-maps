import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

// Identidades del equipo (no secretas). Las contraseñas NO van en el código:
// se generan aleatorias y se devuelven UNA sola vez al sembrar.
const TEAM = [
  { email: "admin@goldaxis.com", name: "Sebastian", role: "superadmin" },
  { email: "juani@goldaxis.com", name: "Juani Podesta", role: "admin" },
  { email: "ezequiel@goldaxis.com", name: "Ezequiel", role: "admin" },
];

function randomPassword(len = 20): string {
  return crypto.randomBytes(len).toString("base64url").slice(0, len);
}

// Comparación en tiempo constante del secreto de seed.
function secretOk(provided: string | null): boolean {
  const expected = process.env.SEED_SECRET || "";
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  // Endpoint de bootstrap protegido: requiere SEED_SECRET (header x-seed-secret).
  if (!secretOk(req.headers.get("x-seed-secret"))) {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const db = await getDb();
  const col = db.collection("admins");
  const results: string[] = [];
  const credenciales: { email: string; password: string }[] = [];

  for (const t of TEAM) {
    const exists = await col.findOne({ email: t.email });
    if (exists) {
      if (exists.role !== t.role) {
        await col.updateOne({ email: t.email }, { $set: { role: t.role } });
        results.push(`Updated ${t.email} role to ${t.role}`);
      } else {
        results.push(`${t.email} already exists (sin cambios)`);
      }
      continue;
    }

    const password = randomPassword();
    const hash = await bcrypt.hash(password, 12);
    await col.insertOne({
      email: t.email,
      name: t.name,
      passwordHash: hash,
      role: t.role,
      totpSecret: null,
      createdAt: new Date(),
    });
    results.push(`Created ${t.name} (${t.email}) as ${t.role}`);
    credenciales.push({ email: t.email, password });
  }

  await col.createIndex({ email: 1 }, { unique: true });

  return Response.json({
    results,
    credenciales,
    nota:
      "Guarda estas contraseñas AHORA; no se vuelven a mostrar. Cámbialas tras el primer acceso.",
  });
}
