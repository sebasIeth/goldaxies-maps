import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

const ADMINS = [
  {
    email: "admin@goldaxis.com",
    name: "Sebastian",
    password: "GoldAxis2024!",
  },
  {
    email: "juani@goldaxis.com",
    name: "Juani Podesta",
    password: "JuaniGA2024!",
  },
  {
    email: "ezequiel@goldaxis.com",
    name: "Ezequiel",
    password: "EzequielGA2024!",
  },
];

export async function POST() {
  const db = await getDb();
  const col = db.collection("admins");
  const results: string[] = [];

  for (const admin of ADMINS) {
    const exists = await col.findOne({ email: admin.email });
    if (exists) {
      results.push(`⏭ ${admin.email} ya existe`);
      continue;
    }

    const hash = await bcrypt.hash(admin.password, 12);
    await col.insertOne({
      email: admin.email,
      name: admin.name,
      passwordHash: hash,
      totpSecret: null,
      createdAt: new Date(),
    });
    results.push(`✅ ${admin.name} (${admin.email}) creado`);
  }

  await col.createIndex({ email: 1 }, { unique: true });

  return Response.json({ results });
}
