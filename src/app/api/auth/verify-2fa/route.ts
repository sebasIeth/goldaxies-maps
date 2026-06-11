import { NextRequest } from "next/server";
import { verifyToken, createToken, setSessionCookie } from "@/lib/auth/jwt";
import { verifyTOTPCode } from "@/lib/auth/totp";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const session = await verifyToken();
  if (!session) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
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
    return Response.json({ error: "Código inválido" }, { status: 401 });
  }

  const token = await createToken({
    email: session.email,
    name: session.name,
    twoFactorVerified: true,
  });
  await setSessionCookie(token);

  return Response.json({ success: true });
}
