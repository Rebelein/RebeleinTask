import { NextRequest, NextResponse } from 'next/server'; // API route handlers
import { getCollections } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

function oid(id: string) { return new ObjectId(id); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tasks } = await getCollections();
  const now = new Date().toISOString();
  const subtasksArray: string[] = body.subtasks || [];
  const subtasks = Object.fromEntries(subtasksArray.map((s: string, i: number) => [String(i+1), { id: String(i+1), text: s, completed: false }]));
  const activityLog = {} as Record<string, any>;
  const actId = 'a1';
  if (body.creatorName) {
    activityLog[actId] = { id: actId, text: `${body.creatorName} hat die Aufgabe erstellt.`, timestamp: now };
  }
  const doc = { ...body, createdAt: now, comments: {}, activityLog, subtasks, status: 'open' };
  const res = await tasks.insertOne(doc);
  return NextResponse.json({ id: res.insertedId.toString() });
}

// Liste aller Tasks (Fallback für Client-Resync)
export async function GET() {
  const { tasks } = await getCollections();
  const docs = await tasks.find().sort({ createdAt: -1 }).toArray();
  return NextResponse.json(docs);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { tasks } = await getCollections();
  const { action, id } = body;
  if (!id) return NextResponse.json({ error: 'id required'}, { status: 400 });

  const task = await tasks.findOne({ _id: oid(id) });
  if (!task) return NextResponse.json({ error: 'not found'}, { status: 404 });

  const now = new Date().toISOString();
  const updates: any = {};
  const pushOps: any = {};

  switch(action) {
    case 'update': {
      const u = body.updates || {};
      // handle subtasks replacement (list of {id?, text})
      if (u.subtasks) {
        const existing: Record<string, any> = task.subtasks || {};
        const list: Array<{id?: string; text: string; completed?: boolean}> = u.subtasks;
        const newRecord: Record<string, any> = {};
        let counter = 1;
        list.forEach(s => {
          if (s.id && existing[s.id]) {
            newRecord[s.id] = { ...existing[s.id], text: s.text };
          } else {
            const nid = `s${counter++}_${Date.now()}`;
            newRecord[nid] = { id: nid, text: s.text, completed: false };
          }
        });
        updates['subtasks'] = newRecord;
        delete u.subtasks;
      }
      Object.keys(u).forEach(k => updates[k] = u[k]);
      break;
    }
    case 'toggleSubtask': {
      const { subtaskId } = body;
      const st = task.subtasks?.[subtaskId];
      if (st) {
        updates[`subtasks.${subtaskId}.completed`] = !st.completed;
      }
      break;
    }
    case 'addComment': {
      const { text, authorId, authorName } = body;
      const comments: Record<string, any> = task.comments || {};
      const newId = `c${Date.now()}`;
      comments[newId] = { id: newId, authorId, text, createdAt: now };
      updates['comments'] = comments;
      const actId = `a${Date.now()}`;
      const activity = task.activityLog || {};
      activity[actId] = { id: actId, text: `${authorName} kommentierte: "${text}"`, timestamp: now };
      updates['activityLog'] = activity;
      break;
    }
    case 'updateStatus': {
      const { status, actorName } = body;
      updates['status'] = status;
      const actId = `a${Date.now()}`;
      const activity = task.activityLog || {};
      activity[actId] = { id: actId, text: `${actorName} hat die Aufgabe als ${status === 'completed' ? 'erledigt' : 'wieder geöffnet'} markiert.`, timestamp: now };
      updates['activityLog'] = activity;
      break;
    }
    case 'addActivity': {
      const { text } = body;
      const actId = `a${Date.now()}`;
      const activity = task.activityLog || {};
      activity[actId] = { id: actId, text, timestamp: now };
      updates['activityLog'] = activity;
      break;
    }
    default: return NextResponse.json({ error: 'unknown action'}, { status: 400 });
    case 'bulkUpdate': {
      const bulk = body.bulk || {} as Record<string, any>;
      const ops = Object.entries(bulk).map(([tid, fields]) => ({ updateOne: { filter: { _id: oid(tid) }, update: { $set: fields } }}));
      if (ops.length>0) {
        // @ts-ignore
        await tasks.bulkWrite(ops);
      }
      return NextResponse.json({ ok: true });
    }
  }

  await tasks.updateOne({ _id: oid(id) }, { $set: updates });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing id'}, { status: 400 });
  const { tasks } = await getCollections();
  await tasks.deleteOne({ _id: oid(id) });
  return NextResponse.json({ ok: true });
}
