import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireSuperAdmin } from "@/lib/auth/protect";
import bcrypt from "bcryptjs";

export async function GET() {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const db = await getDb();
  const admins = await db
    .collection("admins")
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: 1 })
    .toArray();

  return Response.json(
    admins.map((a) => ({
      id: a._id.toString(),
      email: a.email,
      name: a.name,
      role: a.role || "admin",
      has2FA: !!a.totpSecret,
      createdAt: a.createdAt,
      lastLogin: a.lastLogin || null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const { email, name, password } = await req.json();

  if (!email || !name || !password) {
    return Response.json({ error: "Email, name, and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const db = await getDb();
  const exists = await db.collection("admins").findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    return Response.json({ error: "A user with that email already exists" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  await db.collection("admins").insertOne({
    email: email.toLowerCase().trim(),
    name,
    passwordHash: hash,
    role: "admin",
    totpSecret: null,
    createdAt: new Date(),
  });

  return Response.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const { email, role, name, password, reset2FA } = await req.json();

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  if (role && !["admin", "superadmin"].includes(role)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  if (password && password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const db = await getDb();
  const updates: Record<string, unknown> = {};
  if (role) updates.role = role;
  if (name) updates.name = name;
  if (password) updates.passwordHash = await bcrypt.hash(password, 12);
  if (reset2FA) updates.totpSecret = null;

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  const result = await db.collection("admins").updateOne(
    { email: email.toLowerCase().trim() },
    { $set: updates }
  );

  if (result.matchedCount === 0) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const db = await getDb();
  const user = await db.collection("admins").findOne({ email });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (user.role === "superadmin") {
    return Response.json({ error: "Cannot delete a super admin" }, { status: 403 });
  }

  await db.collection("admins").deleteOne({ email });
  return Response.json({ success: true });
}
