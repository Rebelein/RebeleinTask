import { NextRequest, NextResponse } from 'next/server';
import { getCollections } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const oid = (id:string) => new ObjectId(id);

export async function POST(req: NextRequest) {
  const { orderItems } = await getCollections();
  const body = await req.json();
  const now = new Date().toISOString();
  const doc = { text: body.text, quantity: body.quantity || '', requesterId: body.requesterId, status: 'needed', createdAt: now, orderedAt: null, orderedById: null };
  const res = await orderItems.insertOne(doc);
  return NextResponse.json({ id: res.insertedId.toString() });
}

export async function PATCH(req: NextRequest) {
  const { orderItems } = await getCollections();
  const { id, status, actorId } = await req.json();
  if(!id) return NextResponse.json({ error: 'id required'}, { status: 400 });
  const updates: any = { status };
  if(status === 'ordered') {
    updates.orderedAt = new Date().toISOString();
    updates.orderedById = actorId;
  } else {
    updates.orderedAt = null;
    updates.orderedById = null;
  }
  await orderItems.updateOne({ _id: oid(id) }, { $set: updates });
  return NextResponse.json({ ok: true });
}
