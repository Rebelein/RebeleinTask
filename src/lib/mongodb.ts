import { MongoClient, Db, Collection } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/collabtask';
const dbName = uri.split('/').pop() || 'collabtask';

export async function getDb(): Promise<Db> {
  if (db) return db;
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  db = client.db(dbName);
  return db;
}

export async function getCollections() {
  const database = await getDb();
  return {
    tasks: database.collection('tasks'),
    users: database.collection('users'),
    notifications: database.collection('notifications'),
    orderItems: database.collection('orderItems'),
    taskTemplates: database.collection('taskTemplates'),
  } as Record<string, Collection>;
}

export type MongoCollections = Awaited<ReturnType<typeof getCollections>>;
