# CollabTask – Self‑Hosted (MongoDB + Next.js)

Diese Anwendung wurde von Firebase Realtime DB auf MongoDB (Replica Set) mit Server-Sent Events (Change Streams) migriert.

## Stack
* Next.js 15
* MongoDB 7 (Replica Set für Change Streams)
* Tailwind / Radix UI
* Docker / docker-compose (Portainer kompatibel)

## Schnellstart
```
docker compose up --build
```
App: http://localhost:3000  
Mongo Express: http://localhost:8081 (admin / admin)

Erststart seeded automatisch Grunddaten (Users, Tasks, OrderItems) via `/api/seed`.

## Realtime
`/api/events` liefert ein SSE-Stream:
* event: init  -> vollständiger Snapshot
* event: change -> einzelne Änderungen (Mongo Change Streams)

## Wichtige API Endpunkte
| Pfad | Methode | Zweck |
|------|---------|-------|
| /api/seed | POST | Initialdaten seed (idempotent) |
| /api/events | GET | SSE Stream |
| /api/tasks | POST/PATCH/DELETE | Aufgaben CRUD & Aktionen |
| /api/users | POST/PATCH/DELETE | Benutzerverwaltung |
| /api/order-items | POST/PATCH | Einkaufslisten-Einträge |
| /api/templates | POST/PATCH/DELETE | Task-Vorlagen |
| /api/notifications | POST/PATCH | Benachrichtigungen |

## Environment
```
MONGODB_URI=mongodb://mongo:27017/collabtask
```
Siehe `.env.example`.

## Deployment in Portainer
1. Neuen Stack erstellen, Inhalt aus `docker-compose.yml` einfügen.
2. Optional eigenes `.env` mit MONGODB_URI anlegen.
3. Deploy – Replica Set Init Container richtet `rs0` ein.

## Migration Hinweis
Alte Firebase-Datei `src/lib/firebase.ts` ist nur noch Stub. Alle Logik jetzt in:
* `src/lib/mongodb.ts`
* `src/context/app-provider.tsx` (SSE + REST)

## Nächste Verbesserungen (optional)
* Payload-Validierung (z.B. Zod Schemas in API-Routen)
* Server-seitiges Generieren aller Notification/Activity Texte zentral
* Auth / Access Control

---
Für weitere Details: `docs/MIGRATION_TO_MONGODB.md`
