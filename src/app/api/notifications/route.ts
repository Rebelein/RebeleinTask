import { NextRequest, NextResponse } from 'next/server';
import { getCollections } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const oid = (id:string) => new ObjectId(id);

export async function POST(req: NextRequest) {
  const { notifications } = await getCollections();
  const body = await req.json();
  const now = new Date().toISOString();
  const doc = { userId: body.userId, text: body.text, read: false, createdAt: now };
  const res = await notifications.insertOne(doc);
  return NextResponse.json({ id: res.insertedId.toString() });
}

export async function PATCH(req: NextRequest) {
  const { notifications } = await getCollections();
  const { ids, read } = await req.json();
  if(!Array.isArray(ids)) return NextResponse.json({ error: 'ids array required'}, { status: 400 });
  await notifications.updateMany({ _id: { $in: ids.map(oid) } }, { $set: { read: !!read } });
  return NextResponse.json({ ok: true });
}
