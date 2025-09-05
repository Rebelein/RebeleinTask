# Migration von Firebase Realtime DB zu MongoDB (Docker / Portainer)

Dieses Dokument beschreibt die schrittweise Umstellung.

## Schritte Überblick
1. Docker Infrastruktur (MongoDB, App) bereitstellen.
2. MongoDB Verbindungsmodul (`src/lib/mongodb.ts`).
3. API-Routen für Seed und Events.
4. Ersetzen der Firebase-Aufrufe im `AppProvider` durch Fetch-Aufrufe + SSE.
5. Realtime: Simple Server-Sent Events (Polling alle 5s) – optional später echte Change Streams.
6. Datenmodelle beibehalten (Objekt-Keys vs. _id Mapping).

## Realtime Ansatz
Initial einfaches SSE mit Polling. Optional Upgrade:
- MongoDB Change Streams (benötigt replSet). In Docker: `--replSet rs0` setzen und nach Start `rs.initiate()` ausführen.

## Nächste Schritte im Code
- `firebase.ts` entfernen/ersetzen.
- In `app-provider.tsx` State Laden via `/api/events` (SSE) & Schreiboperationen via neue API Endpunkte (noch zu erstellen).

## Offene Punkte
- CRUD API Endpunkte für Tasks, Users, Notifications, OrderItems, Templates.
- Auth (derzeit lokal nur userId Auswahl).
