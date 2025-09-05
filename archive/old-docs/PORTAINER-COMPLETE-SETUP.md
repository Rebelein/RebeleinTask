# Portainer Server Setup & RebeleinTask Deployment Anleitung

## 🎯 Übersicht
- **Portainer Interface**: https://217.154.223.78:9443
- **RebeleinTask App**: https://rebelleintask.duckdns.org
- **Mongo Express**: http://217.154.223.78:8081
- **Traefik Dashboard**: https://traefik.rebelleintask.duckdns.org

## 🚀 Server Setup Schritte

### 1. Server-Basis installieren
```bash
# System aktualisieren
apt update && apt upgrade -y

# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose Plugin
apt install docker-compose-plugin -y

# Firewall konfigurieren
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 9000/tcp  # Portainer HTTP
ufw allow 9443/tcp  # Portainer HTTPS
ufw allow 8081/tcp  # Mongo Express
ufw allow 8080/tcp  # Traefik Dashboard
ufw --force enable

# Projekt-Verzeichnis erstellen
mkdir -p /opt/portainer
cd /opt/portainer
```

### 2. Portainer Admin-Passwort setzen
```bash
# Passwort-Datei erstellen (RebeleinTask2025!)
echo 'RebeleinTask2025!' > portainer_password.txt
```

### 3. Portainer starten
```bash
# Portainer Server deployen
docker-compose -f docker-compose.portainer-server.yml up -d

# Status prüfen
docker-compose -f docker-compose.portainer-server.yml ps
docker logs portainer_server
```

### 4. Portainer Web-Interface öffnen
- **URL**: https://217.154.223.78:9443
- **Username**: admin
- **Password**: RebeleinTask2025!

## 📱 RebeleinTask über Portainer deployen

### 1. Portainer öffnen und anmelden
1. Browser: `https://217.154.223.78:9443`
2. Login: admin / RebeleinTask2025!
3. Environment: "local" auswählen

### 2. Stack erstellen
1. **Sidebar**: "Stacks" → "Add stack"
2. **Name**: `rebelleintask-production`
3. **Method**: "Web editor"
4. **Compose**: Inhalt von `docker-compose.portainer-stack.yml` einfügen

### 3. Stack konfigurieren
1. **Environment variables** (optional):
   - `DUCKDNS_TOKEN`: de3aa6cf-bf20-4b8c-b367-149bf463ba48
   - `ADMIN_EMAIL`: goettfert.florian@gmail.com

2. **Access control**: Default

3. **Deploy the stack**: Klicken

### 4. Deployment überwachen
1. **Stacks** → "rebelleintask-production"
2. **Services** Tab → Status prüfen
3. **Logs** Tab → Container-Logs anzeigen

## 🔍 Monitoring & Management

### Container Status prüfen
- **Portainer**: Stacks → rebelleintask-production → Services
- **CLI**: `docker ps`

### Logs anzeigen
- **Portainer**: Container → Logs Tab
- **CLI**: `docker logs container_name -f`

### Services neu starten
- **Portainer**: Container → Restart
- **CLI**: `docker restart container_name`

### Updates deployen
1. **Portainer**: Stacks → rebelleintask-production
2. **Editor** Tab → Compose-Datei bearbeiten
3. **Update the stack** → Deploy

## 🌐 Zugriff nach Deployment

### Hauptanwendung
- **URL**: https://rebelleintask.duckdns.org
- **PWA**: Installierbar nach erfolgreichem SSL-Setup
- **Auto-Redirect**: HTTP → HTTPS

### Verwaltung
- **Portainer**: https://217.154.223.78:9443
- **Mongo Express**: http://217.154.223.78:8081 (admin/RebeleinTask2025!)
- **Traefik Dashboard**: http://217.154.223.78:8080

### SSL-Zertifikat Status
- **Let's Encrypt**: Automatisch nach 1-5 Minuten
- **Check**: Browser zeigt grünes Schloss
- **Renewal**: Automatisch alle 60 Tage

## ⚡ Schnell-Befehle für Server

### Portainer Management
```bash
# Portainer Container Status
docker ps | grep portainer

# Portainer Logs
docker logs portainer_server -f

# Portainer neu starten
docker restart portainer_server

# Portainer stoppen/starten
docker-compose -f docker-compose.portainer-server.yml down
docker-compose -f docker-compose.portainer-server.yml up -d
```

### Stack Management (über CLI)
```bash
# Alle Container anzeigen
docker ps -a

# Stack-Container stoppen
docker stop $(docker ps -q --filter "label=com.docker.compose.project=rebelleintask-production")

# Stack-Container starten
docker start $(docker ps -aq --filter "label=com.docker.compose.project=rebelleintask-production")

# Logs aller Stack-Container
docker logs traefik_proxy -f
docker logs rebelleintask_app -f
docker logs rebelleintask_mongo -f
```

## 🛠️ Troubleshooting

### Portainer nicht erreichbar
```bash
# Status prüfen
docker ps | grep portainer
docker logs portainer_server

# Port prüfen
netstat -tulpn | grep 9443

# Firewall prüfen
ufw status
```

### SSL-Zertifikat Probleme
```bash
# Traefik Logs
docker logs traefik_proxy -f

# ACME-Datei prüfen
docker exec traefik_proxy cat /acme.json

# DNS prüfen
nslookup rebelleintask.duckdns.org
```

### App startet nicht
```bash
# App Logs
docker logs rebelleintask_app -f

# MongoDB Verbindung prüfen
docker exec rebelleintask_app ping mongo

# Netzwerk prüfen
docker network ls
docker network inspect rebelleintask-production_rebellein_network
```

## 📞 Support & Updates

### Backup erstellen
- **Portainer**: Settings → Backup configuration
- **MongoDB**: Automatisch in Volume gespeichert
- **SSL-Zertifikate**: In Traefik ACME-Volume

### Updates
- **Portainer**: Watchtower aktualisiert automatisch
- **RebeleinTask**: Über Portainer Stack-Editor
- **System**: `apt update && apt upgrade`

---

**Viel Erfolg mit Ihrem Portainer-Setup! 🎉**
