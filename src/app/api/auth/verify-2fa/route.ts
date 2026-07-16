import { NextRequest } from "next/server";
import { verifyToken, createToken, setSessionCookie } from "@/lib/auth/jwt";
import { verifyTOTPCode } from "@/lib/auth/totp";
import { getDb } from "@/lib/mongodb";

// Rate limiting contra fuerza bruta del código TOTP, por cuenta.
// Nota: es en memoria (por instancia); para producción multi-instancia
// conviene un store persistente (Redis/Upstash).
const attempts = new Map<string, { count: number; first: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function tooMany(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) return false;
  return rec.count >= MAX_ATTEMPTS;
}
function registerFail(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
  } else {
    rec.count++;
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyToken();
  if (!session) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const key = session.email;
  if (tooMany(key)) {
    return Response.json(
      { error: "Demasiados intentos. Esperá 15 minutos." },
      { status: 429 }
    );
  }

  const { code } = await req.json();
  if (!code) {
    return Response.json({ error: "Código requerido" }, { status: 400 });
  }

  // Buscar secreto TOTP de este usuario en MongoDB
  const db = await getDb();
  const admin = await db.collection("admins").findOne({ email: session.email });

  if (!admin?.totpSecret) {
    return Response.json({ error: "2FA no configurado" }, { status: 400 });
  }

  const valid = verifyTOTPCode(admin.totpSecret, code);
  if (!valid) {
    registerFail(key);
    return Response.json({ error: "Código inválido" }, { status: 401 });
  }

  attempts.delete(key); // éxito: limpia el contador

  const token = await createToken({
    email: session.email,
    name: session.name,
    role: session.role,
    twoFactorVerified: true,
  });
  await setSessionCookie(token);

  return Response.json({ success: true });
}
