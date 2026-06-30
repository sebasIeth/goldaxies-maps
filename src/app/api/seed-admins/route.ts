import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

const ADMINS = [
  {
    email: "admin@goldaxis.com",
    name: "Sebastian",
    password: "GoldAxis2024!",
    role: "superadmin",
  },
  {
    email: "juani@goldaxis.com",
    name: "Juani Podesta",
    password: "JuaniGA2024!",
    role: "admin",
  },
  {
    email: "ezequiel@goldaxis.com",
    name: "Ezequiel",
    password: "EzequielGA2024!",
    role: "admin",
  },
];

export async function POST() {
  const db = await getDb();
  const col = db.collection("admins");
  const results: string[] = [];

  for (const admin of ADMINS) {
    const exists = await col.findOne({ email: admin.email });
    if (exists) {
      // Update role if it changed
      if (exists.role !== admin.role) {
        await col.updateOne({ email: admin.email }, { $set: { role: admin.role } });
        results.push(`Updated ${admin.email} role to ${admin.role}`);
      } else {
        results.push(`${admin.email} already exists`);
      }
      continue;
    }

    const hash = await bcrypt.hash(admin.password, 12);
    await col.insertOne({
      email: admin.email,
      name: admin.name,
      passwordHash: hash,
      role: admin.role,
      totpSecret: null,
      createdAt: new Date(),
    });
    results.push(`Created ${admin.name} (${admin.email}) as ${admin.role}`);
  }

  await col.createIndex({ email: 1 }, { unique: true });

  return Response.json({ results });
}
