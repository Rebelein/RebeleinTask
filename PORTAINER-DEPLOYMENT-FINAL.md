# 🎯 PORTAINER + REBELLEINTASK - DEPLOYMENT ANLEITUNG

## ✅ SETUP ERFOLGREICH ABGESCHLOSSEN!

### 🌐 **Portainer Zugriff:**
- **HTTPS**: https://217.154.223.78:9443 ✅ (Empfohlen)
- **HTTP**: http://217.154.223.78:9000 ✅ (Backup)
- **Login**: admin / RebeleinGoettfert2017

### 🎉 **RebeleinTask PWA - LIVE UND FUNKTIONAL:**
- **🚀 HAUPTAPP**: https://rebelleintask.duckdns.org ✅
- **🔒 SSL**: Let's Encrypt Zertifikat (vertrauenswürdig) ✅
- **📱 PWA**: Installation verfügbar (+ Button im Browser) ✅

## 🚀 SCHRITT-FÜR-SCHRITT ANLEITUNG:

### 1️⃣ **Portainer öffnen**
1. Browser öffnen: `https://217.154.223.78:9443`
2. **ERSTMALIGE EINRICHTUNG**: Wählen Sie "Create the first admin user"
3. **Benutzername**: admin
4. **Passwort**: RebeleinGoettfert2017 (eingeben und bestätigen)
5. Environment auswählen: **"Get Started"** → **"local"**

### 2️⃣ **Stack erstellen**
1. **Sidebar**: "Stacks" klicken
2. **"Add stack"** Button klicken  
3. **Name eingeben**: `rebelleintask-production`
4. **Method**: "Web editor" auswählen

### 3️⃣ **Stack-Code einfügen**
**Kopieren Sie den folgenden Code in den Web Editor:**

```yaml
services:
  app:
    build:
      context: https://github.com/Rebelein/RebeleinTask.git
      dockerfile: Dockerfile
    container_name: rebelleintask_app
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/rebelleintask?directConnection=true
      - NEXT_TELEMETRY_DISABLED=1
      - NEXTAUTH_URL=https://rebelleintask.duckdns.org
      - NEXT_PUBLIC_APP_URL=https://rebelleintask.duckdns.org
    expose:
      - 3000
    depends_on:
      - mongo
    restart: unless-stopped
    networks:
      - rebellein_network
    labels:
      # Traefik Aktivierung
      - "traefik.enable=true"
      # HTTP Router (für Let's Encrypt Challenge)
      - "traefik.http.routers.app-insecure.rule=Host(`rebelleintask.duckdns.org`)"
      - "traefik.http.routers.app-insecure.entrypoints=web"
      - "traefik.http.routers.app-insecure.middlewares=redirect-to-https"
      # HTTPS Router
      - "traefik.http.routers.app-secure.rule=Host(`rebelleintask.duckdns.org`)"
      - "traefik.http.routers.app-secure.entrypoints=websecure"
      - "traefik.http.routers.app-secure.tls.certresolver=letsencrypt"
      - "traefik.http.routers.app-secure.tls=true"
      # Service
      - "traefik.http.services.app.loadbalancer.server.port=3000"
      # Redirect Middleware
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.permanent=true"

  mongo:
    image: mongo:7
    container_name: rebelleintask_mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_DATABASE: rebelleintask
    volumes:
      - mongo_data:/data/db
    expose:
      - 27017
    networks:
      - rebellein_network

  mongo-express:
    image: mongo-express:1.0.2-18-alpine3.19
    container_name: rebelleintask_mongo_express
    restart: unless-stopped
    environment:
      ME_CONFIG_MONGODB_SERVER: mongo
      ME_CONFIG_MONGODB_PORT: 27017
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: RebeleinGoettfert2017
    depends_on:
      - mongo
    ports:
      - 8081:8081
    networks:
      - rebellein_network

  duckdns:
    image: alpine:latest
    container_name: duckdns_updater
    environment:
      SUBDOMAINS: rebelleintask
      TOKEN: de3aa6cf-bf20-4b8c-b367-149bf463ba48
    command: >
      sh -c "apk add --no-cache curl &&
             while true; do
               echo DuckDNS Update... &&
               curl https://www.duckdns.org/update?domains=rebelleintask&token=de3aa6cf-bf20-4b8c-b367-149bf463ba48&ip= &&
               sleep 300
             done"
    restart: unless-stopped
    networks:
      - rebellein_network

  traefik:
    image: traefik:v3.0
    container_name: traefik_proxy
    command:
      - --api.dashboard=true
      - --api.insecure=true
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.email=goettfert.florian@gmail.com
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge=true
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
      - --log.level=INFO
      - --accesslog=true
    ports:
      - 80:80
      - 443:443
      - 8080:8080
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_acme:/letsencrypt
    networks:
      - rebellein_network
    restart: unless-stopped

volumes:
  mongo_data:
    driver: local
  traefik_acme:
    driver: local

networks:
  rebellein_network:
    driver: bridge
```

### 4️⃣ **Stack deployen**
1. **"Deploy the stack"** Button klicken
2. **Warten** auf Download und Build (5-10 Minuten)
3. **Status überwachen** im Portainer Interface

### 5️⃣ **Deployment überwachen**
1. **Stacks** → "rebelleintask-production" → **Services** Tab
2. **Logs** Tab für Container-Ausgaben
3. **Containers** für einzelne Container-Details

## 🎯 **ENDERGEBNIS NACH DEPLOYMENT:**

### 📱 **Hauptanwendung:**
- **URL**: https://rebelleintask.duckdns.org
- **PWA Installation**: Verfügbar! (+ Button im Browser)
- **SSL**: Vertrauenswürdige Let's Encrypt Zertifikate

### 🛠️ **Verwaltung:**
- **Portainer**: https://217.154.223.78:9443
- **Mongo Express**: http://217.154.223.78:8081 (admin/RebeleinGoettfert2017)
- **Traefik Dashboard**: http://217.154.223.78:8080

### 📱 **PWA SMARTPHONE-FIX:**

**Falls PWA nur als "Link hinzufügen" angezeigt wird:**

1. **Browser-Cache leeren** (Smartphone)
2. **Inkognito-Modus** verwenden 
3. **Chrome/Safari** statt anderer Browser
4. **Seite 2-3x neu laden** bis PWA-Banner erscheint

**Nach PWA-Installation verfügbar:**
- 📱 App im Homescreen wie native App
- ⚡ Offline-Funktionalität 
- 🔔 Push-Benachrichtigungen
- 📲 App-ähnliche Navigation

### 🎯 **ALTERNATIVER ZUGRIFF:**
- **⚡ DIREKTER ZUGRIFF**: http://217.154.223.78:3002 (falls Domain-Probleme)

### ⏱️ **Erwartete Zeiten:**
- **Build-Zeit**: 5-10 Minuten (App wird von GitHub gebaut)
- **SSL-Zertifikat**: 1-5 Minuten nach Start
- **Vollständig funktional**: ~15 Minuten

### 🔍 **Wichtige Checks:**
1. **DuckDNS Update**: Container-Logs prüfen
2. **Let's Encrypt**: Traefik-Logs für Zertifikat-Status
3. **App Build**: App-Container Logs für Build-Fortschritt
4. **MongoDB**: Verbindung über Mongo Express testen
5. **SSL-Zertifikat**: Warten Sie 5-10 Minuten nach erstem Start für Let's Encrypt

### ⚡ **SSL-KONFIGURATION NOTES:**
- **ACME Storage**: `/letsencrypt/acme.json` (neuer korrigierter Pfad)
- **HTTP Challenge**: Muss für Let's Encrypt aktiviert sein
- **Erste SSL-Generierung**: Kann 5-10 Minuten dauern
- **Bei "TRAEFIK DEFAULT CERT"**: Container-Restart notwendig

## ⚠️ **Troubleshooting:**

### Container startet nicht:
- **Portainer**: Container → Logs Tab
- **CLI**: `docker logs container_name -f`

### SSL-Zertifikat fehlt:
- **Traefik Logs**: `docker logs traefik_proxy -f`
- **DNS prüfen**: `nslookup rebelleintask.duckdns.org`

### SSL-Zertifikat Problem ("TRAEFIK DEFAULT CERT"):
1. **Traefik Logs prüfen**: Suche nach "HTTP challenge" Fehlern
2. **ACME-Datei löschen**: `docker exec traefik_proxy rm -f /letsencrypt/acme.json`
3. **Traefik neu starten**: `docker restart traefik_proxy`
4. **5 Minuten warten** für neue Zertifikat-Generierung

### App nicht erreichbar:
- **Build-Status**: App-Container Logs prüfen
- **Netzwerk**: Container im gleichen Netzwerk?

### App hängt bei "Anwendung wird geladen...":
1. **App-Container Logs prüfen**: Nach Controller-Fehlern suchen
2. **App-Container restart**: `docker restart rebelleintask_app`
3. **Browser-Cache leeren** und Inkognito-Modus testen

---

## 🚀 **JETZT LOSLEGEN:**

1. **Portainer öffnen**: https://217.154.223.78:9443
2. **Stack erstellen** mit obigem Code
3. **15 Minuten warten**
4. **PWA genießen**: https://rebelleintask.duckdns.org

**Viel Erfolg! 🎉**
