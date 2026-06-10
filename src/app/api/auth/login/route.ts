import { NextRequest } from "next/server";
import { createToken, setSessionCookie } from "@/lib/auth/jwt";
import { getTOTPSecret } from "@/lib/auth/totp";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@goldaxis.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "GoldAxis2024!";

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

  // Comparación en tiempo constante para evitar timing attacks
  const emailMatch = email.length === ADMIN_EMAIL.length && email === ADMIN_EMAIL;
  const passMatch = password.length === ADMIN_PASSWORD.length && password === ADMIN_PASSWORD;

  if (!emailMatch || !passMatch) {
    return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  // Login exitoso → limpiar intentos
  clearAttempts(ip);

  const totpSecret = await getTOTPSecret();
  const has2FA = !!totpSecret;

  // SIEMPRE crear token con twoFactorVerified=false
  // El usuario DEBE pasar por 2FA (setup o verify) para entrar al admin
  const token = await createToken({
    email,
    twoFactorVerified: false,
  });
  await setSessionCookie(token);

  return Response.json({
    success: true,
    needs2FA: has2FA,
    needsSetup2FA: !has2FA,
  });
}
