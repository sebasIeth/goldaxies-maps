import { NextRequest } from "next/server";
import { verifyToken, createToken, setSessionCookie } from "@/lib/auth/jwt";
import { getTOTPSecret, verifyTOTPCode } from "@/lib/auth/totp";

export async function POST(req: NextRequest) {
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
    return Response.json({ error: "Código inválido" }, { status: 401 });
  }

  const token = await createToken({
    email: session.email,
    twoFactorVerified: true,
  });
  await setSessionCookie(token);

  return Response.json({ success: true });
}
