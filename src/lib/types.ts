export type User = {
  id: string;
  name: string;
  initials: string;
  avatar?: string; // Avatar is now optional
};

export type Subtask = {
  id: string;
  text: string;
  completed: boolean;
};

export type Comment = {
  id:string;
  authorId: string;
  text: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  text: string;
  timestamp: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  collaboratorIds: string[];
  subtasks: Record<string, Subtask>;
  comments: Record<string, Comment>;
  activityLog: Record<string, Activity>;
  createdAt: string;
  dueDate: string | null;
  status: 'open' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dependsOn?: string[];
  blocks?: string[];
};

export type Notification = {
  id: string;
  userId: string;
  text: string;
  read: boolean;
  createdAt: string;
};

export type OrderItem = {
  id: string;
  text: string;
  quantity?: string;
  requesterId: string;
  status: 'needed' | 'ordered';
  createdAt: string;
  orderedAt: string | null;
  orderedById: string | null;
};

export type TaskTemplate = {
  id: string;
  name: string;
  title: string;
  description?: string;
  subtasks: string[];
  priority: 'low' | 'medium' | 'high';
  collaboratorIds?: string[];
};
