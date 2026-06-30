import { verifyToken } from "@/lib/auth/jwt";

export async function GET() {
  const session = await verifyToken();

  if (!session || !session.twoFactorVerified) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  return Response.json({
    authenticated: true,
    email: session.email,
    name: session.name,
    role: session.role,
  });
}
