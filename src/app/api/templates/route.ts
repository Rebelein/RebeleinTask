import { NextRequest, NextResponse } from 'next/server';
import { getCollections } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const oid = (id:string) => new ObjectId(id);

export async function POST(req: NextRequest) {
  const { taskTemplates } = await getCollections();
  const body = await req.json();
  const doc = { name: body.name, title: body.title, description: body.description || '', subtasks: body.subtasks || [], priority: body.priority || 'medium', collaboratorIds: body.collaboratorIds || [] };
  const res = await taskTemplates.insertOne(doc);
  return NextResponse.json({ id: res.insertedId.toString() });
}

export async function PATCH(req: NextRequest) {
  const { taskTemplates } = await getCollections();
  const { id, updates } = await req.json();
  if(!id) return NextResponse.json({ error: 'id required'}, { status: 400 });
  await taskTemplates.updateOne({ _id: oid(id) }, { $set: updates });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { taskTemplates } = await getCollections();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if(!id) return NextResponse.json({ error: 'id required'}, { status: 400 });
  await taskTemplates.deleteOne({ _id: oid(id) });
  return NextResponse.json({ ok: true });
}
