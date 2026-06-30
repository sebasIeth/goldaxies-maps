import { verifyToken } from "./jwt";
import { getDb } from "@/lib/mongodb";

export async function requireAdmin(): Promise<Response | null> {
  const session = await verifyToken();

  if (!session) {
    return Response.json({ error: "Not authorized" }, { status: 401 });
  }

  if (!session.twoFactorVerified) {
    return Response.json({ error: "2FA not verified" }, { status: 403 });
  }

  return null;
}

export async function requireSuperAdmin(): Promise<Response | null> {
  const session = await verifyToken();

  if (!session) {
    return Response.json({ error: "Not authorized" }, { status: 401 });
  }

  if (!session.twoFactorVerified) {
    return Response.json({ error: "2FA not verified" }, { status: 403 });
  }

  const db = await getDb();
  const user = await db.collection("admins").findOne({ email: session.email });

  if (!user || user.role !== "superadmin") {
    return Response.json({ error: "Super admin access required" }, { status: 403 });
  }

  return null;
}
