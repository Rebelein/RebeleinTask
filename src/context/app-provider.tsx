
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initialTasks, users as initialUsers, initialOrderItems } from '@/lib/mock-data';
import type { Task, User, Notification, Subtask, Comment, Activity, OrderItem, TaskTemplate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
// Firebase entfernt – Nutzung eigener API + SSE (MongoDB Change Streams)

interface AppContextType {
  tasks: Task[];
  users: User[];
  orderItems: OrderItem[];
  taskTemplates: TaskTemplate[];
  currentUser: User | null; // Can be null initially
  notifications: Notification[];
  setCurrentUser: (user: User | null) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'activityLog' | 'comments' | 'subtasks' | 'status'> & { subtasks: string[] }) => void;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'subtasks'>>) => void;
  updateTaskStatus: (taskId: string, status: 'open' | 'completed') => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addComment: (taskId: string, text: string) => void;
  getUnreadNotificationCount: (userId: string) => number;
  markNotificationsAsRead: (userId: string) => void;
  addUser: (name: string, initials: string) => void;
  updateUser: (userId: string, updates: { name: string; initials: string }) => void;
  deleteUser: (userId: string) => void;
  deleteTask: (taskId: string) => void;
  addOrderItem: (text: string, quantity?: string) => void;
  updateOrderItemStatus: (itemId: string, status: OrderItem['status']) => void;
  addTemplate: (template: Omit<TaskTemplate, 'id'>) => void;
  updateTemplate: (templateId: string, updates: Partial<Omit<TaskTemplate, 'id'>>) => void;
  deleteTemplate: (templateId: string) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CURRENT_USER_STORAGE_KEY = 'collabtask_current_user_id';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    // Seed (einmalig) – ruft /api/seed auf
    fetch('/api/seed', { method: 'POST' }).catch(()=>{}).finally(() => {
      // EventSource verbinden
      const es = new EventSource('/api/events');
      let refreshTimer: any = null;
      const scheduleTasksRefresh = () => {
        if (refreshTimer) clearTimeout(refreshTimer);
        refreshTimer = setTimeout(async () => {
          try {
            const res = await fetch('/api/tasks');
            if (!res.ok) return;
            const data = await res.json();
            const mapped = (data || []).map((d:any)=> ({ ...d, id: d._id?.toString() || d.id }));
            setTasks(prev => {
              // Wenn der Fallback mehr Einträge hat oder wir nur 1 haben aber DB >1 → ersetzen
              if (mapped.length > prev.length || prev.length <= 1) return mapped;
              // Merge anhand IDs
              const mapPrev = new Map(prev.map(t => [t.id, t]));
              mapped.forEach((t:any)=> mapPrev.set(t.id, { ...mapPrev.get(t.id), ...t }));
              return Array.from(mapPrev.values()).sort((a:any,b:any)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
            });
          } catch {}
        }, 300);
      };
      const applyFull = (data: any) => {
        const mapDocs = (arr: any[]) => arr.map(d => ({ ...d, id: d._id?.toString() || d.id }));
        setTasks(mapDocs(data.tasks).sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()));
        const userList = mapDocs(data.users);
        setUsers(userList);
        setNotifications(mapDocs(data.notifications).sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()));
        setOrderItems(mapDocs(data.orderItems).sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()));
        setTaskTemplates(mapDocs(data.taskTemplates));
        if(userList.length>0){
          const storedUserId = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
          if(storedUserId){
            const u = userList.find(x=>x.id===storedUserId);
            setCurrentUser(u||null);
          }
        }
        setLoading(false);
      };
      es.addEventListener('init', (e:any) => {
        const data = JSON.parse(e.data);
        applyFull(data);
      });
      // Vollständiger Tasks Snapshot nach jeder Änderung vom Server
      es.addEventListener('tasksSnapshot', (e:any) => {
        try {
          const payload = JSON.parse(e.data);
          if (Array.isArray(payload.tasks)) {
            const mapped = payload.tasks.map((d:any)=> ({ ...d, id: d._id?.toString() || d.id }));
            setTasks(mapped.sort((a:any,b:any)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()));
            console.debug('[tasksSnapshot] applied', mapped.length);
          }
        } catch {}
      });
      es.addEventListener('change', (e:any) => {
        const ev = JSON.parse(e.data);
        const coll: string = ev.ns;
        const op: string = ev.op;
        const doc = ev.doc || null;
        // Ermittele ID (auch bei delete ohne fullDocument)
        let id: string | undefined = doc?._id?.toString();
        if(!id && ev.id && (ev.id._id || (ev.id.documentKey && ev.id.documentKey._id))) {
          id = (ev.id._id || ev.id.documentKey._id).toString();
        }
        const norm = doc ? { ...doc, id } : null;

        function apply(setter: React.Dispatch<React.SetStateAction<any[]>>) {
          setter(prev => {
            try {
              if (coll === 'tasks') {
                console.debug('[SSE change]', { coll, op, id, prevCount: prev.length, hasDoc: !!norm });
              }
            } catch {}
            if(!id) return prev;
            if(op === 'delete') {
              if (coll === 'tasks') console.debug('[SSE change] delete -> removing id', id);
              return prev.filter((it:any) => it.id !== id);
            }
            const idx = prev.findIndex((it:any)=> it.id === id);
            if(idx >= 0) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...norm };
              if (coll === 'tasks') console.debug('[SSE change] updated existing task', { id, newCount: copy.length });
              return copy;
            }
            // Neu vorne einfügen
            const result = norm ? [norm, ...prev] : prev;
            if (coll === 'tasks') console.debug('[SSE change] inserted new task', { id, newCount: result.length });
            return result;
          });
        }

        switch(coll){
          case 'tasks': apply(setTasks); break;
          case 'users': apply(setUsers); break;
          case 'notifications': apply(setNotifications); break;
          case 'orderItems': apply(setOrderItems); break;
          case 'taskTemplates': apply(setTaskTemplates); break;
        }
        if (coll === 'tasks') {
          // Fallback-Refresh triggern (Debounce)
          scheduleTasksRefresh();
        }
      });
      return () => es.close();
    });
  }, []);

  const handleSetCurrentUser = (user: User | null) => {
      if (user) {
        const userFromDb = users.find(u => u.id === user.id);
        if(userFromDb) {
            localStorage.setItem(CURRENT_USER_STORAGE_KEY, user.id);
            setCurrentUser(userFromDb);
        }
      } else {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        setCurrentUser(null);
      }
  }

  const addNotification = async (userId: string, text: string) => {
    await fetch('/api/notifications', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId, text }) });
  };
  
  const addActivity = async (taskId: string, text: string) => {
    await fetch('/api/tasks', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'addActivity', id: taskId, text }) });
  };

  const addUser = async (name: string, initials: string) => {
    await fetch('/api/users', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, initials }) });
    toast({ title: 'Benutzer hinzugefügt', description: `Der Benutzer "${name}" wurde erfolgreich hinzugefügt.` });
  };

  const updateUser = async (userId: string, updates: { name: string; initials: string }) => {
    try {
      await fetch('/api/users', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: userId, updates }) });
      toast({ title: 'Benutzer aktualisiert', description: 'Die Benutzerdaten wurden gespeichert.' });
    } catch(e){
      toast({ variant: 'destructive', title: 'Fehler', description: 'Benutzer konnte nicht aktualisiert werden.' });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!currentUser) return;
    if (users.length <= 1) {
      toast({ variant: 'destructive', title: 'Aktion nicht erlaubt', description: 'Der letzte Benutzer kann nicht gelöscht werden.' });
      return;
    }
     if (userId === currentUser.id) {
      toast({ variant: 'destructive', title: 'Aktion nicht erlaubt', description: 'Sie können den aktuell angemeldeten Benutzer nicht löschen.' });
      return;
    }

    const updates: Record<string, any> = {};
    const tasksToDelete: string[] = [];

    tasks.forEach(task => {
      // Remove user from collaborators
      if (task.collaboratorIds?.includes(userId)) {
        const newCollaborators = task.collaboratorIds.filter(id => id !== userId);
        if (newCollaborators.length > 0) {
          updates[`/tasks/${task.id}/collaboratorIds`] = newCollaborators;
        } else {
          // If the user was the last collaborator, delete the task
          tasksToDelete.push(task.id);
        }
      }
      // If the user is the creator and only collaborator, mark for deletion
      if (task.creatorId === userId && task.collaboratorIds?.length <= 1 && task.collaboratorIds?.includes(userId)) {
        if (!tasksToDelete.includes(task.id)) {
           tasksToDelete.push(task.id);
        }
      }
    });

    tasksToDelete.forEach(taskId => {
      updates[`/tasks/${taskId}`] = null;
    });

    // Remove the user itself
    updates[`/users/${userId}`] = null;

    try {
      await fetch(`/api/users?id=${userId}`, { method:'DELETE' });
      toast({ title: 'Benutzer gelöscht', description: 'Der Benutzer und zugehörige verwaiste Aufgaben wurden entfernt.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Der Benutzer konnte nicht gelöscht werden.' });
    }
  };


  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'activityLog' | 'comments' | 'subtasks' | 'status'> & { subtasks: string[] }) => {
    if (!currentUser) return;
    await fetch('/api/tasks', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...taskData, subtasks: taskData.subtasks, creatorName: currentUser.name }) });
    taskData.collaboratorIds.forEach(collaboratorId => {
      if (collaboratorId !== currentUser.id) {
        addNotification(collaboratorId, `${currentUser.name} hat Sie zu einer neuen Aufgabe hinzugefügt: "${taskData.title}"`);
      }
    });
    toast({ title: 'Aufgabe erstellt', description: `"${taskData.title}" wurde erfolgreich erstellt.` });
  };

  const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'subtasks'>>) => {
     if (!currentUser) return;
     
     const currentTask = tasks.find(t => t.id === taskId);
     if (!currentTask) return;

     const { subtasks: newSubtaskList, ...otherUpdates } = updates as any;
     const dbUpdates: Record<string, any> = {};

  let constructedSubtasks: Record<string, Subtask> | undefined = undefined;
  if (newSubtaskList) {
   const newSubtasks: Record<string, Subtask> = {};
      const existingSubtasks = currentTask.subtasks || {};
      const existingSubtaskTexts = Object.values(existingSubtasks).map(s => s.text);
      
      // Keep existing subtasks that are still in the new list
      Object.values(existingSubtasks).forEach(sub => {
        if(newSubtaskList.some((s:any) => s.text === sub.text)){
            newSubtasks[sub.id] = sub;
        }
      });
      
      // Add new subtasks
  newSubtaskList.forEach((sub:any) => {
        if(!existingSubtaskTexts.includes(sub.text)){
          const id = `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          newSubtasks[id] = { id, text: sub.text, completed: false };
        }
      });
  constructedSubtasks = newSubtasks;
    }
    
    // --- Dependency Logic ---
    const oldDependencies = currentTask.dependsOn || [];
    const newDependencies = updates.dependsOn || [];
    
    const addedDependencies = newDependencies.filter(d => !oldDependencies.includes(d));
    const removedDependencies = oldDependencies.filter(d => !newDependencies.includes(d));

    if (addedDependencies.length > 0 || removedDependencies.length > 0) {
      // Add activity log for dependency changes
      addActivity(taskId, `${currentUser.name} hat die Abhängigkeiten der Aufgabe bearbeitet.`);
    }

    // For tasks that are now depended on, add this task to their `blocks` array
    addedDependencies.forEach(depId => {
      const depTask = tasks.find(t => t.id === depId);
      if (depTask) {
        const newBlocks = [...(depTask.blocks || []), taskId];
        dbUpdates[`/tasks/${depId}/blocks`] = newBlocks;
      }
    });

    // For tasks that are no longer depended on, remove this task from their `blocks` array
    removedDependencies.forEach(depId => {
      const depTask = tasks.find(t => t.id === depId);
      if (depTask) {
        const newBlocks = (depTask.blocks || []).filter(bId => bId !== taskId);
        dbUpdates[`/tasks/${depId}/blocks`] = newBlocks;
      }
    });

    // --- End Dependency Logic ---
    
  Object.entries(otherUpdates).forEach(([k,v]) => { (dbUpdates as any)[k] = v; });
  await fetch('/api/tasks', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'update', id: taskId, updates: { ...dbUpdates, subtasks: constructedSubtasks ? Object.values(constructedSubtasks) : undefined } }) });
    
    addActivity(taskId, `${currentUser.name} hat die Aufgabe bearbeitet.`);
    
    toast({ title: 'Aufgabe aktualisiert', description: 'Die Änderungen wurden gespeichert.'});
    
    if (updates.collaboratorIds) {
        updates.collaboratorIds.forEach(collaboratorId => {
            if (collaboratorId !== currentUser.id && !currentTask.collaboratorIds.includes(collaboratorId)) {
                 addNotification(collaboratorId, `${currentUser.name} hat Sie zur Aufgabe "${currentTask.title}" hinzugefügt.`);
            }
        });
    }
  };
  
  const updateTaskStatus = async (taskId: string, status: 'open' | 'completed') => {
    if (!currentUser) return;
    await fetch('/api/tasks', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'updateStatus', id: taskId, status, actorName: currentUser.name }) });
    
    const task = tasks.find(t => t.id === taskId);
    if(task) {
      const activityText = `${currentUser.name} hat die Aufgabe als ${status === 'completed' ? 'erledigt' : 'wieder geöffnet'} markiert.`;
      addActivity(taskId, activityText);
      toast({ title: 'Status aktualisiert', description: `Aufgabe "${task.title}" wurde als ${status === 'completed' ? 'erledigt' : 'wieder geöffnet'} markiert.` });
    
      task.collaboratorIds.forEach(collaboratorId => {
        if (collaboratorId !== currentUser.id) {
          addNotification(collaboratorId, `Die Aufgabe "${task.title}" wurde als ${status === 'completed' ? 'erledigt' : 'wieder geöffnet'} markiert.`);
        }
      });
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    if (!currentUser) return;
    await fetch('/api/tasks', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'toggleSubtask', id: taskId, subtaskId }) });
  };

  const addComment = async (taskId: string, text: string) => {
    if (!currentUser) return;
    await fetch('/api/tasks', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'addComment', id: taskId, text, authorId: currentUser.id, authorName: currentUser.name }) });

    const activityText = `${currentUser.name} kommentierte: "${text}"`;
    addActivity(taskId, activityText);

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Mention logic
    const mentionRegex = /@(\w+)/g;
    const mentionedNames = [...text.matchAll(mentionRegex)].map(match => match[1]);

    const notifiedUserIds = new Set<string>();

    if (mentionedNames.length > 0) {
      mentionedNames.forEach(name => {
        const mentionedUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());
        if (mentionedUser && mentionedUser.id !== currentUser.id) {
          notifiedUserIds.add(mentionedUser.id);
        }
      });
    } else {
      // Default behavior: notify all other collaborators if no one is mentioned
      task.collaboratorIds.forEach(collaboratorId => {
        if (collaboratorId !== currentUser.id) {
          notifiedUserIds.add(collaboratorId);
        }
      });
    }

    notifiedUserIds.forEach(userId => {
        const notificationText = mentionedNames.length > 0
            ? `${currentUser.name} hat Sie in einem Kommentar zur Aufgabe "${task.title}" erwähnt.`
            : `${currentUser.name} hat die Aufgabe "${task.title}" kommentiert`;
        addNotification(userId, notificationText);
    });
  };
  
  const deleteTask = async (taskId: string) => {
    if (!currentUser) return;
    
    const updates: Record<string, any> = {};
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;
    
    // Remove this task from the `dependsOn` array of tasks that it blocks
    (taskToDelete.blocks || []).forEach(blockedTaskId => {
      const blockedTask = tasks.find(t => t.id === blockedTaskId);
      if (blockedTask) {
        const newDependsOn = (blockedTask.dependsOn || []).filter(id => id !== taskId);
        updates[`/tasks/${blockedTaskId}/dependsOn`] = newDependsOn;
      }
    });

    // Remove this task from the `blocks` array of tasks it depends on
    (taskToDelete.dependsOn || []).forEach(dependencyId => {
      const dependencyTask = tasks.find(t => t.id === dependencyId);
      if (dependencyTask) {
        const newBlocks = (dependencyTask.blocks || []).filter(id => id !== taskId);
        updates[`/tasks/${dependencyId}/blocks`] = newBlocks;
      }
    });

    // Delete the task itself
    updates[`/tasks/${taskId}`] = null;
    
    await fetch(`/api/tasks?id=${taskId}`, { method:'DELETE' })
      .then(()=> toast({ title: 'Aufgabe gelöscht', description: `Aufgabe "${taskToDelete?.title}" wurde gelöscht.` }))
      .catch(()=> toast({ variant: 'destructive', title: 'Fehler', description: 'Aufgabe konnte nicht gelöscht werden.' }));
  };
  
  const addOrderItem = async (text: string, quantity?: string) => {
    if (!currentUser) return;
    await fetch('/api/order-items', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text, quantity, requesterId: currentUser.id }) });
  };
  
  const updateOrderItemStatus = async (itemId: string, status: OrderItem['status']) => {
    if (!currentUser) return;
    await fetch('/api/order-items', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: itemId, status, actorId: currentUser.id }) });

    const item = orderItems.find(i => i.id === itemId);
    if (item) {
       toast({ title: 'Bestellstatus aktualisiert', description: `"${item.text}" wurde als "${status === 'ordered' ? 'bestellt' : 'benötigt'}" markiert.` });
    }
  };

  const getUnreadNotificationCount = (userId: string) => {
    if (!currentUser) return 0;
    return notifications.filter(n => n.userId === userId && !n.read).length;
  };
  
  const markNotificationsAsRead = (userId: string) => {
    if (!currentUser) return;
    const updates: Record<string, any> = {};
    notifications.forEach(n => {
        if(n.userId === userId && !n.read) {
            updates[`/notifications/${n.id}/read`] = true;
        }
    });
  if(Object.keys(updates).length > 0) {
    fetch('/api/notifications', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ids: Object.keys(updates).map(id=>id.split('/')[2]), read: true }) });
  }
  };

  const addTemplate = async (template: Omit<TaskTemplate, 'id'>) => {
    try {
      await fetch('/api/templates', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(template) });
      toast({ title: 'Vorlage erstellt', description: `Die Vorlage "${template.name}" wurde erfolgreich erstellt.` });
    } catch(e){
      toast({ variant: 'destructive', title: 'Fehler', description: 'Vorlage konnte nicht erstellt werden.' });
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<Omit<TaskTemplate, 'id'>>) => {
    try {
      await fetch('/api/templates', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: templateId, updates }) });
      toast({ title: 'Vorlage aktualisiert', description: 'Die Änderungen wurden gespeichert.' });
    } catch(e){
      toast({ variant: 'destructive', title: 'Fehler', description: 'Vorlage konnte nicht aktualisiert werden.' });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await fetch(`/api/templates?id=${templateId}`, { method:'DELETE' });
      toast({ title: 'Vorlage gelöscht' });
    } catch(e){
      toast({ variant: 'destructive', title: 'Fehler', description: 'Vorlage konnte nicht gelöscht werden.' });
    }
  };

  return (
    <AppContext.Provider value={{ tasks, users, orderItems, taskTemplates, currentUser, notifications, setCurrentUser: handleSetCurrentUser, addTask, updateTask, updateUser, updateTaskStatus, toggleSubtask, addComment, deleteTask, addOrderItem, updateOrderItemStatus, getUnreadNotificationCount, markNotificationsAsRead, addUser, deleteUser, addTemplate, updateTemplate, deleteTemplate, loading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
