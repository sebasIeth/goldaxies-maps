import { NextRequest } from "next/server";
import { createToken, setSessionCookie } from "@/lib/auth/jwt";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

// Rate limiting simple en memoria
const attempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now - record.lastAttempt > WINDOW_MS) {
    attempts.set(ip, { count: 1, lastAttempt: now });
    return false;
  }

  record.count++;
  record.lastAttempt = now;

  if (record.count > MAX_ATTEMPTS) {
    return true;
  }

  return false;
}

function clearAttempts(ip: string) {
  attempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Demasiados intentos. Intentá de nuevo en 15 minutos." },
      { status: 429 }
    );
  }

  const { email, password } = await req.json();

  if (!email || !password) {
    return Response.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
  }

  // Buscar admin en MongoDB
  const db = await getDb();
  const admin = await db.collection("admins").findOne({ email: email.toLowerCase().trim() });

  if (!admin) {
    return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const passMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!passMatch) {
    return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  // Login exitoso → limpiar intentos
  clearAttempts(ip);

  const has2FA = !!admin.totpSecret;

  // SIEMPRE crear token con twoFactorVerified=false
  // El usuario DEBE pasar por 2FA (setup o verify) para entrar al admin
  const token = await createToken({
    email: admin.email,
    name: admin.name,
    twoFactorVerified: false,
  });
  await setSessionCookie(token);

  return Response.json({
    success: true,
    name: admin.name,
    needs2FA: has2FA,
    needsSetup2FA: !has2FA,
  });
}
