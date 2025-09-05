import { NextRequest, NextResponse } from 'next/server';
import { getCollections } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const oid = (id:string) => new ObjectId(id);

export async function POST(req: NextRequest) {
  const { users } = await getCollections();
  const body = await req.json();
  const doc = { name: body.name, initials: body.initials.toUpperCase(), avatar: body.avatar || null };
  const res = await users.insertOne(doc);
  return NextResponse.json({ id: res.insertedId.toString() });
}

export async function PATCH(req: NextRequest) {
  const { users } = await getCollections();
  const { id, updates } = await req.json();
  if(!id) return NextResponse.json({ error: 'id required'}, { status: 400 });
  await users.updateOne({ _id: oid(id) }, { $set: { name: updates.name, initials: updates.initials.toUpperCase() } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { users, tasks } = await getCollections();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if(!id) return NextResponse.json({ error: 'id required'}, { status: 400 });
  // remove user from collaboratorIds, delete tasks where only this user
  const allTasks = await tasks.find().toArray();
  for(const t of allTasks) {
    const collabs: string[] = t.collaboratorIds || [];
    if(collabs.includes(id)) {
      const newCollabs = collabs.filter(c => c !== id);
      if(newCollabs.length === 0) {
        await tasks.deleteOne({ _id: t._id });
      } else {
        await tasks.updateOne({ _id: t._id }, { $set: { collaboratorIds: newCollabs } });
      }
    }
  }
  await users.deleteOne({ _id: oid(id) });
  return NextResponse.json({ ok: true });
}
