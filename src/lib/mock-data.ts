import type { User, Task, OrderItem } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'Alice', initials: 'A' },
  { id: 'user-2', name: 'Ben', initials: 'B' },
  { id: 'user-3', name: 'Clara', initials: 'C' },
  { id: 'user-4', name: 'David', initials: 'D' },
];

export const initialOrderItems: Omit<OrderItem, 'id'>[] = [
  { text: '10x Rohrschellen 1/2"', requesterId: 'user-1', status: 'needed', createdAt: new Date().toISOString(), orderedAt: null, orderedById: null },
  { text: '5x SML Bogen DN100 87°', requesterId: 'user-2', status: 'needed', createdAt: new Date().toISOString(), orderedAt: null, orderedById: null },
  { text: 'Silikonspray', requesterId: 'user-1', status: 'ordered', createdAt: new Date().toISOString(), orderedAt: new Date().toISOString(), orderedById: 'user-1' },
];


export const initialTasks: Omit<Task, 'id'>[] = [
  {
    title: 'Q3-Marketingkampagne entwerfen',
    description: 'Entwickeln Sie eine umfassende Marketingkampagne für das dritte Quartal mit Schwerpunkt auf digitalen Kanälen.',
    creatorId: 'user-1',
    collaboratorIds: ['user-2'],
    subtasks: {
      'sub-1-1': { id: 'sub-1-1', text: 'Kampagnenziele und KPIs definieren', completed: true },
      'sub-1-2': { id: 'sub-1-2', text: 'Anzeigentexte und Bildmaterial erstellen', completed: false },
      'sub-1-3': { id: 'sub-1-3', text: 'Tracking und Analysen einrichten', completed: false },
    },
    comments: {
        'comment-1-1': { id: 'comment-1-1', authorId: 'user-1', text: 'Hallo @Ben, was hältst du davon, für diese Kampagne eine jüngere Zielgruppe anzusprechen?', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    },
    activityLog: {
      'act-1-1': { id: 'act-1-1', text: 'Alice hat die Aufgabe erstellt.', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      'act-1-2': { id: 'act-1-2', text: 'Alice hat Ben zur Aufgabe hinzugefügt.', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      'act-1-3': { id: 'act-1-3', text: 'Ben hat die Teilaufgabe "Kampagnenziele und KPIs definieren" abgeschlossen.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    priority: 'high',
  },
  {
    title: 'Neues "Echtzeit"-Feature entwickeln',
    description: 'Implementieren Sie die Echtzeit-Kollaborationsfunktion wie besprochen mit WebSockets.',
    creatorId: 'user-3',
    collaboratorIds: ['user-1'],
    subtasks: {
      'sub-2-1': { id: 'sub-2-1', text: 'WebSocket-Server einrichten', completed: true },
      'sub-2-2': { id: 'sub-2-2', text: 'In das clientseitige Zustandsmanagement integrieren', completed: true },
      'sub-2-3': { id: 'sub-2-3', text: 'Auf Parallelitätsprobleme testen', completed: false },
      'sub-2-4': { id: 'sub-2-4', text: 'In Staging-Umgebung bereitstellen', completed: false },
    },
    comments: {},
    activityLog: {
       'act-2-1': { id: 'act-2-1', text: 'Clara hat die Aufgabe erstellt und Alice hinzugefügt.', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    priority: 'medium',
  },
  {
    title: 'Benutzer-Authentifizierungsablauf',
    description: 'Entwerfen und implementieren Sie den vollständigen Anmelde- und Registrierungsablauf für Benutzer.',
    creatorId: 'user-1',
    collaboratorIds: ['user-3'],
    subtasks: {
      'sub-3-1': { id: 'sub-3-1', text: 'UI-Mockups entwerfen', completed: true },
      'sub-3-2': { id: 'sub-3-2', text: 'Frontend-Komponenten erstellen', completed: true },
      'sub-3-3': { id: 'sub-3-3', text: 'Mit Backend-Authentifizierungsdienst integrieren', completed: true },
    },
    comments: {
        'comment-3-1': { id: 'comment-3-1', authorId: 'user-3', text: 'Alles erledigt! Bereit zur Überprüfung.', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    },
    activityLog: {
        'act-3-1': { id: 'act-3-1', text: 'Alice hat die Aufgabe erstellt.', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    priority: 'high',
  },
  {
    title: 'CSS auf Tailwind umstellen',
    description: 'Migrieren Sie alle alten CSS-Dateien auf Tailwind-Utility-Klassen, um die Wartbarkeit zu verbessern.',
    creatorId: 'user-2',
    collaboratorIds: ['user-2'],
    subtasks: {},
    comments: {},
    activityLog: {
        'act-4-1': { id: 'act-4-1', text: 'Ben hat die Aufgabe für sich selbst erstellt.', timestamp: new Date().toISOString() },
    },
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    priority: 'low',
  },
];
