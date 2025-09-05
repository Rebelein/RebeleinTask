import { NextRequest, NextResponse } from 'next/server';
import { getCollections } from '@/lib/mongodb';
import { initialTasks, users as initialUsers, initialOrderItems } from '@/lib/mock-data';

export async function POST(req: NextRequest) {
  const { tasks, users, notifications, orderItems, taskTemplates } = await getCollections();

  const taskCount = await tasks.countDocuments();
  const userCount = await users.countDocuments();

  if (taskCount === 0 && userCount === 0) {
    await users.insertMany(initialUsers.map(u => ({ ...u })));

    for (const task of initialTasks) {
      const subArray: string[] = (task as any).subtasks || [];
      const subtasks = Object.fromEntries(subArray.map((s: string, i: number) => [String(i+1), { id: String(i+1), text: s, completed: false }]));
      await tasks.insertOne({
        ...task,
        status: (task as any).status || 'open',
        comments: {},
        subtasks,
        activityLog: {}
      });
    }

    for (const item of initialOrderItems) {
      await orderItems.insertOne({ ...item, status: item.status || 'needed' });
    }
  }

  return NextResponse.json({ seeded: true });
}
