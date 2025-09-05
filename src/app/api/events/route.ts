import { NextRequest } from 'next/server';
import { getDb, getCollections } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const { tasks, users, notifications, orderItems, taskTemplates } = await getCollections();
  const db = await getDb();

  async function fullSnapshot() {
    const [tasksData, usersData, notificationsData, orderItemsData, templatesData] = await Promise.all([
      tasks.find().toArray(),
      users.find().toArray(),
      notifications.find().toArray(),
      orderItems.find().toArray(),
      taskTemplates.find().toArray(),
    ]);
    return { tasks: tasksData, users: usersData, notifications: notificationsData, orderItems: orderItemsData, taskTemplates: templatesData };
  }

  const stream = new ReadableStream({
    async start(controller) {
      // initial dump
      const initial = await fullSnapshot();
      controller.enqueue(encoder.encode(`event: init\ndata: ${JSON.stringify(initial)}\n\n`));

      const changeStreams = [
        tasks.watch([], { fullDocument: 'updateLookup' }),
        users.watch([], { fullDocument: 'updateLookup' }),
        notifications.watch([], { fullDocument: 'updateLookup' }),
        orderItems.watch([], { fullDocument: 'updateLookup' }),
        taskTemplates.watch([], { fullDocument: 'updateLookup' }),
      ];

      function send(type: string, payload: any) {
        controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`));
      }

      changeStreams.forEach((cs) => {
        cs.on('change', async (change: any) => {
          try {
            const coll = change.ns?.coll;
            // Einzelereignis
            send('change', { ns: coll, op: change.operationType, doc: change.fullDocument, id: change.documentKey });
            // Für Tasks zusätzlich kompletter Snapshot (robuster gegen Merge-Probleme)
            if (coll === 'tasks') {
              try {
                const { tasks } = await getCollections();
                const all = await tasks.find().sort({ createdAt: -1 }).toArray();
                send('tasksSnapshot', { tasks: all });
              } catch (e) {
                send('error', { message: 'tasksSnapshot failed: ' + (e as Error).message });
              }
            }
          } catch (e) {
            send('error', { message: (e as Error).message });
          }
        });
        cs.on('error', (err: any) => send('error', { message: err.message }));
      });

      controller.enqueue(encoder.encode(`event: open\ndata: connected\n\n`));

      // Heartbeat
      const hb = setInterval(() => controller.enqueue(encoder.encode(`: keep-alive\n\n`)), 15000);

      return () => {
        clearInterval(hb);
        changeStreams.forEach(cs => cs.close());
      };
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
