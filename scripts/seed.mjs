import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONGODB_URI =
  "mongodb+srv://sebasdev:45359800@cluster0.avros9a.mongodb.net/goldaxis?appName=Cluster0";

async function seed() {
  console.log("Conectando a MongoDB...");
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db("goldaxis");
  const collection = db.collection("commerces");

  // Verificar si ya hay datos
  const count = await collection.countDocuments();
  if (count > 0) {
    console.log(`Ya hay ${count} comercios en la DB. ¿Quieres reemplazarlos?`);
    console.log("Eliminando datos existentes...");
    await collection.deleteMany({});
  }

  // Leer JSON local
  const jsonPath = join(__dirname, "../src/data/commerces.json");
  const data = JSON.parse(readFileSync(jsonPath, "utf-8"));

  // Insertar sin el campo "id" (MongoDB genera _id)
  const docs = data.map((c) => ({
    name: c.name,
    type: c.type,
    description: c.description,
    address: c.address,
    lat: c.lat,
    lng: c.lng,
    logo: c.logo,
    createdAt: new Date(),
  }));

  const result = await collection.insertMany(docs);
  console.log(`✅ ${result.insertedCount} comercios insertados en MongoDB`);

  // Crear índice geoespacial por si se necesita después
  await collection.createIndex({ lat: 1, lng: 1 });
  console.log("✅ Índice geo creado");

  await client.close();
  console.log("Conexión cerrada. ¡Listo!");
}

seed().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
