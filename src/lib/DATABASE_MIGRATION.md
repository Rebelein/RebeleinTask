# Anleitung zur Datenbankmigration

Dieses Dokument beschreibt die notwendigen Schritte, um die in dieser Anwendung verwendete Firebase Realtime Database durch eine alternative Datenbank (z.B. MongoDB) zu ersetzen.

## Übersicht

Die gesamte Datenbanklogik ist bewusst in einer einzigen Datei zentralisiert, um die Migration zu vereinfachen. Alle Codeabschnitte, die direkt mit der Firebase-Datenbank interagieren, sind mit dem Kommentar `// mongodb` markiert.

## Betroffene Dateien

1.  **`src/context/app-provider.tsx`**: Enthält die komplette Logik zum Lesen und Schreiben von Daten.
2.  **`src/lib/firebase.ts`**: Enthält die Konfiguration und Initialisierung der Firebase-Verbindung.

## Schritte zur Migration

### 1. Neue Datenbankverbindung herstellen

- Ersetzen Sie den Inhalt von `src/lib/firebase.ts` mit Ihrer neuen Datenbank-Initialisierungslogik. Exportieren Sie die neue Datenbankinstanz, damit sie im `AppProvider` importiert werden kann.

### 2. Datenabruf anpassen

- Suchen Sie in `src/context/app-provider.tsx` nach dem `useEffect`-Hook, der die initialen Daten lädt und Echtzeit-Listener (`onValue`) einrichtet.
- Entfernen oder ersetzen Sie die `onValue`-Aufrufe durch die entsprechenden Methoden Ihrer neuen Datenbank, um Daten abzurufen und auf Änderungen zu lauschen. Passen Sie die Logik an, um die Zustände `tasks`, `users`, `orderItems` und `notifications` zu füllen.

### 3. Datenmanipulationsfunktionen umschreiben

- Gehen Sie durch die Datei `src/context/app-provider.tsx` und suchen Sie nach allen Stellen mit der Markierung `// mongodb`.
- Jede dieser markierten Operationen (z.B. `set`, `push`, `update`, `remove`, `get`) muss durch das Äquivalent Ihrer neuen Datenbank-API ersetzt werden.

Die folgenden Funktionen müssen angepasst werden:

-   `addNotification`
-   `addActivity`
-   `addUser`
-   `updateUser`
-   `deleteUser`
-   `addTask`
-   `updateTask`
-   `updateTaskStatus`
-   `toggleSubtask`
-   `addComment`
-   `deleteTask`
-   `addOrderItem`
-   `updateOrderItemStatus`
-   `markNotificationsAsRead`
-   `addTemplate`
-   `updateTemplate`
-   `deleteTemplate`

Stellen Sie sicher, dass die Datenstrukturen (`Task`, `User` etc. aus `src/lib/types.ts`) konsistent bleiben oder passen Sie die Lese-/Schreibvorgänge entsprechend an die neuen Datenbankschemata an.
