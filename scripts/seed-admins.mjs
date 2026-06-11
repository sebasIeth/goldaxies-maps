import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  "mongodb+srv://sebasdev:45359800@cluster0.avros9a.mongodb.net/goldaxis?appName=Cluster0";

const admins = [
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

async function seed() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db("goldaxis");
  const col = db.collection("admins");

  for (const admin of admins) {
    const exists = await col.findOne({ email: admin.email });
    if (exists) {
      console.log(`⏭  ${admin.email} ya existe, saltando...`);
      continue;
    }

    const hash = await bcrypt.hash(admin.password, 12);
    await col.insertOne({
      email: admin.email,
      name: admin.name,
      passwordHash: hash,
      totpSecret: null, // Cada usuario configura su propio 2FA
      createdAt: new Date(),
    });
    console.log(`✅ ${admin.name} (${admin.email}) creado`);
  }

  // Índice único por email
  await col.createIndex({ email: 1 }, { unique: true });
  console.log("\n🔑 Índice único en email creado");

  await client.close();
  console.log("\n🎉 Seed completado!");
  console.log("\nCredenciales:");
  console.log("─────────────────────────────────────────");
  for (const a of admins) {
    console.log(`  ${a.name.padEnd(16)} → ${a.email} / ${a.password}`);
  }
  console.log("─────────────────────────────────────────");
  console.log("Cada usuario configura su 2FA en el primer login.\n");
}

seed().catch(console.error);
