import { NextRequest } from "next/server";
import { verifyToken, createToken, setSessionCookie } from "@/lib/auth/jwt";
import { createTOTP, getTOTPSecret, saveTOTPSecret, verifyTOTPCode } from "@/lib/auth/totp";
import QRCode from "qrcode";

// GET: genera QR y secreto temporal
export async function POST() {
  const session = await verifyToken();
  if (!session) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const existing = await getTOTPSecret();
  if (existing) {
    return Response.json({ error: "2FA ya está configurado" }, { status: 400 });
  }

  const totp = createTOTP();
  const secret = totp.secret.base32;
  const uri = totp.toString();

  // Guardar el secreto inmediatamente (necesario para verificar)
  await saveTOTPSecret(secret);

  const qrDataUrl = await QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    color: { dark: "#D4AF37", light: "#0A0A0A" },
  });

  // NO dar acceso aún — el usuario debe verificar el código
  return Response.json({ qrDataUrl, secret });
}

// PUT: verificar el primer código y activar la sesión
export async function PUT(req: NextRequest) {
  const session = await verifyToken();
  if (!session) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code) {
    return Response.json({ error: "Código requerido" }, { status: 400 });
  }

  const secret = await getTOTPSecret();
  if (!secret) {
    return Response.json({ error: "2FA no configurado" }, { status: 400 });
  }

  const valid = verifyTOTPCode(secret, code);
  if (!valid) {
    return Response.json({ error: "Código inválido. Escaneá el QR de nuevo." }, { status: 401 });
  }

  // Código correcto → dar acceso completo
  const token = await createToken({
    email: session.email,
    twoFactorVerified: true,
  });
  await setSessionCookie(token);

  return Response.json({ success: true });
}
