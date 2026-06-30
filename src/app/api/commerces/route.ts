import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth/protect";

const COLLECTION = "commerces";

// GET es público — el mapa lo necesita sin auth
export async function GET() {
  const db = await getDb();
  const docs = await db.collection(COLLECTION).find().toArray();

  const commerces = docs.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    type: d.type,
    description: d.description || "",
    address: d.address,
    lat: d.lat,
    lng: d.lng,
    logo: d.logo || "/logos/market.svg",
    phone: d.phone || "",
  }));

  return Response.json(commerces);
}

// POST, PUT, DELETE requieren admin autenticado con 2FA

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const { name, type, description, address, lat, lng, logo, phone } = body;

  if (!name || !type || !address || lat == null || lng == null) {
    return Response.json(
      { error: "Faltan campos obligatorios: name, type, address, lat, lng" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const doc = {
    name,
    type,
    description: description || "",
    address,
    lat: Number(lat),
    lng: Number(lng),
    logo: logo || "/logos/market.svg",
    phone: phone || "",
    createdAt: new Date(),
  };

  const result = await db.collection(COLLECTION).insertOne(doc);

  return Response.json(
    { id: result.insertedId.toString(), ...doc },
    { status: 201 }
  );
}

export async function PUT(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return Response.json({ error: "Falta el id del comercio" }, { status: 400 });
  }

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return Response.json({ error: "ID inválido" }, { status: 400 });
  }

  const db = await getDb();

  const setFields: Record<string, unknown> = {};
  if (updates.name != null) setFields.name = updates.name;
  if (updates.type != null) setFields.type = updates.type;
  if (updates.description != null) setFields.description = updates.description;
  if (updates.address != null) setFields.address = updates.address;
  if (updates.lat != null) setFields.lat = Number(updates.lat);
  if (updates.lng != null) setFields.lng = Number(updates.lng);
  if (updates.logo != null) setFields.logo = updates.logo;
  if (updates.phone != null) setFields.phone = updates.phone;
  setFields.updatedAt = new Date();

  const result = await db
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: objectId },
      { $set: setFields },
      { returnDocument: "after" }
    );

  if (!result) {
    return Response.json({ error: "Comercio no encontrado" }, { status: 404 });
  }

  return Response.json({
    id: result._id.toString(),
    name: result.name,
    type: result.type,
    description: result.description,
    address: result.address,
    lat: result.lat,
    lng: result.lng,
    logo: result.logo,
    phone: result.phone || "",
  });
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Falta el id del comercio" }, { status: 400 });
  }

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return Response.json({ error: "ID inválido" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection(COLLECTION).deleteOne({ _id: objectId });

  if (result.deletedCount === 0) {
    return Response.json({ error: "Comercio no encontrado" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
