# RebeleinTask - Docker Deployment Guide

## Über das Projekt
RebeleinTask ist eine kollaborative Aufgabenverwaltungsanwendung, die mit Next.js und MongoDB entwickelt wurde.

## Docker Deployment mit Portainer

### Voraussetzungen
- Docker und Docker Compose installiert
- Portainer installiert und konfiguriert

### Deployment-Optionen

#### Option 1: Mit vorgefertigtem Image (Empfohlen)
Das Docker Image wird automatisch über GitHub Actions erstellt und ist verfügbar unter:
`ghcr.io/rebelein/rebelleintask:latest`

**Portainer Stack Deployment:**
1. Öffne Portainer in deinem Browser
2. Gehe zu "Stacks" → "Add Stack"
3. Wähle "Repository" als Deployment-Methode
4. Repository URL: `https://github.com/Rebelein/RebeleinTask`
5. Compose file path: `docker-compose.portainer.yml`
6. Klicke auf "Deploy the stack"

#### Option 2: Manuelles Build
```bash
# Repository klonen
git clone https://github.com/Rebelein/RebeleinTask.git
cd RebeleinTask

# Docker Compose ausführen
docker-compose up -d
```

### Zugriff auf die Anwendung
- **Hauptanwendung**: http://localhost:3000
- **MongoDB Express**: http://localhost:8081 (admin/admin)
- **MongoDB**: localhost:27017

### Umgebungsvariablen
Die folgenden Umgebungsvariablen können in Portainer konfiguriert werden:

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `MONGODB_URI` | MongoDB Verbindungsstring | `mongodb://mongo:27017/rebelleintask` |
| `NODE_ENV` | Node.js Umgebung | `production` |
| `NEXT_TELEMETRY_DISABLED` | Next.js Telemetrie deaktivieren | `1` |

### Volumes
- `mongo_data`: Persistente MongoDB Daten

### Netzwerk
Alle Services laufen im `rebelleintask_network` für sichere interne Kommunikation.

### Troubleshooting

#### MongoDB Replica Set
Falls MongoDB Probleme hat:
```bash
# In MongoDB Container
mongosh
rs.initiate({_id:"rs0",members:[{_id:0,host:"mongo:27017"}]})
```

#### Logs anzeigen
```bash
# Alle Services
docker-compose logs

# Spezifischer Service
docker-compose logs app
docker-compose logs mongo
```

#### Container neu starten
```bash
# Alle Services
docker-compose restart

# Spezifischer Service
docker-compose restart app
```

### Development
Für lokale Entwicklung:
```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

### Support
Bei Problemen erstelle bitte ein Issue im GitHub Repository: https://github.com/Rebelein/RebeleinTask/issues
