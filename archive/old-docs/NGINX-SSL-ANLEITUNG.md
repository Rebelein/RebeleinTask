# 🔐 Nginx + SSL Setup - Detaillierte Anleitung

## 🎯 Ziel: HTTPS mit Nginx für echte PWA-Installation

Diese Anleitung führt dich durch das komplette Setup von Nginx mit automatisch generierten SSL-Zertifikaten.

---

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Aktuelle App stoppen
1. **Portainer öffnen** → `http://217.154.223.78:9000`
2. **Stacks** → **rebelleintask** (deine aktuelle App)
3. **Stop** → **Remove** (oder **Down**)

### Schritt 2: Neue HTTPS-Stack erstellen
1. **Stacks** → **Add Stack**
2. **Stack name**: `rebelleintask-ssl`
3. **Build method**: **Web editor**

### Schritt 3: Konfiguration einfügen

**Kopiere diese KOMPLETTE Konfiguration in den Web Editor:**

```yaml
version: '3.8'

services:
  app:
    build: 
      context: https://github.com/Rebelein/RebeleinTask.git
      dockerfile: Dockerfile
    container_name: rebelleintask_app
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/rebelleintask
      - NEXT_TELEMETRY_DISABLED=1
    expose:
      - "3000"
    depends_on:
      - mongo
    restart: unless-stopped
    networks:
      - rebelleintask_network

  # Nginx HTTPS Proxy
  nginx:
    image: nginx:alpine
    container_name: rebelleintask_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - nginx_config:/etc/nginx
      - nginx_ssl:/etc/nginx/ssl
    depends_on:
      - app
      - ssl-gen
      - nginx-config
    restart: unless-stopped
    networks:
      - rebelleintask_network

  # SSL Certificate Generator
  ssl-gen:
    image: alpine:latest
    container_name: ssl_generator
    volumes:
      - nginx_ssl:/ssl
    command: >
      sh -c "
        apk add --no-cache openssl &&
        if [ ! -f /ssl/cert.pem ]; then
          echo 'Generating self-signed SSL certificate...' &&
          openssl req -x509 -nodes -days 365 -newkey rsa:2048 
            -keyout /ssl/key.pem 
            -out /ssl/cert.pem 
            -subj '/C=DE/ST=Germany/L=City/O=RebeleinTask/OU=IT/CN=rebelleintask.local' &&
          echo 'SSL certificate generated successfully!'
        else
          echo 'SSL certificate already exists.'
        fi &&
        echo 'SSL setup complete. Certificate valid for 365 days.'
      "
    restart: "no"

  # Nginx Configuration Generator
  nginx-config:
    image: alpine:latest
    container_name: nginx_config_gen
    volumes:
      - nginx_config:/config
    command: >
      sh -c "
        mkdir -p /config &&
        cat > /config/nginx.conf << 'EOF'
        events {
            worker_connections 1024;
        }

        http {
            upstream app {
                server app:3000;
            }

            # Security headers
            add_header X-Frame-Options DENY;
            add_header X-Content-Type-Options nosniff;
            add_header X-XSS-Protection '1; mode=block';

            # Redirect HTTP to HTTPS
            server {
                listen 80;
                server_name _;
                location / {
                    return 301 https://\$host\$request_uri;
                }
            }

            # HTTPS server
            server {
                listen 443 ssl http2;
                server_name _;

                ssl_certificate /etc/nginx/ssl/cert.pem;
                ssl_certificate_key /etc/nginx/ssl/key.pem;
                
                # Modern SSL configuration
                ssl_protocols TLSv1.2 TLSv1.3;
                ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
                ssl_prefer_server_ciphers off;
                ssl_session_cache shared:SSL:10m;
                ssl_session_timeout 10m;

                # HSTS (HTTP Strict Transport Security)
                add_header Strict-Transport-Security 'max-age=31536000; includeSubDomains' always;

                # Root location
                location / {
                    proxy_pass http://app;
                    proxy_set_header Host \$host;
                    proxy_set_header X-Real-IP \$remote_addr;
                    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto \$scheme;
                    proxy_set_header X-Forwarded-Host \$host;
                    proxy_set_header X-Forwarded-Port \$server_port;
                    
                    # WebSocket support
                    proxy_http_version 1.1;
                    proxy_set_header Upgrade \$http_upgrade;
                    proxy_set_header Connection 'upgrade';
                    proxy_cache_bypass \$http_upgrade;
                }

                # Health check
                location /health {
                    access_log off;
                    return 200 'healthy';
                    add_header Content-Type text/plain;
                }
            }
        }
        EOF
        echo 'Nginx configuration generated successfully!'
      "
    restart: "no"

  mongo:
    image: mongo:7
    container_name: rebelleintask_mongo
    restart: unless-stopped
    command: ["mongod", "--replSet", "rs0", "--bind_ip_all"]
    environment:
      MONGO_INITDB_DATABASE: rebelleintask
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"
    networks:
      - rebelleintask_network

  mongo-init-replica:
    image: mongo:7
    depends_on:
      - mongo
    entrypoint: ["sh", "-c", "sleep 10 && mongosh --host mongo:27017 --eval 'rs.initiate({_id:\"rs0\",members:[{_id:0,host:\"mongo:27017\"}]})' || true"]
    restart: "no"
    networks:
      - rebelleintask_network

  mongo-express:
    image: mongo-express:1.0.2-18-alpine3.19
    container_name: rebelleintask_mongo_express
    restart: unless-stopped
    environment:
      ME_CONFIG_MONGODB_SERVER: mongo
      ME_CONFIG_MONGODB_PORT: 27017
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: admin
    depends_on:
      - mongo
    ports:
      - "8081:8081"
    networks:
      - rebelleintask_network

volumes:
  mongo_data:
    driver: local
  nginx_ssl:
    driver: local
  nginx_config:
    driver: local

networks:
  rebelleintask_network:
    driver: bridge
```

### Schritt 4: Stack deployen
1. **Deploy the stack** klicken
2. **Warten** bis alle Container gestartet sind (3-5 Minuten)
3. **Logs überprüfen**: Container → Logs

### Schritt 5: SSL-Setup überprüfen

**Container-Status prüfen:**
```
✅ ssl_generator - Should be "Exited (0)"
✅ nginx_config_gen - Should be "Exited (0)" 
✅ rebelleintask_nginx - Should be "Running"
✅ rebelleintask_app - Should be "Running"
```

---

## 🌐 Nach dem Deployment testen

### 1. HTTPS-Zugriff testen
- **URL**: `https://217.154.223.78`
- **Erwartung**: Browser-Warnung wegen selbstsigniertem Zertifikat

### 2. Zertifikat akzeptieren
**Chrome:**
1. "Erweitert" klicken
2. "Weiter zu 217.154.223.78 (unsicher)" klicken

**Firefox:**
1. "Erweitert" klicken  
2. "Risiko akzeptieren und fortfahren"

**Safari:**
1. "Details anzeigen"
2. "Diese Website besuchen"

### 3. PWA-Installation testen
- ✅ **Install-Banner** erscheint nach 3 Sekunden
- ✅ **"App installieren"** statt "Verknüpfung erstellen"
- ✅ **Native App** wird installiert!

---

## 🔧 Troubleshooting

### Problem: Container startet nicht
**Lösung:**
1. **Portainer** → **Stacks** → **rebelleintask-ssl** → **Editor**
2. **Update the stack** klicken
3. **Logs** überprüfen

### Problem: SSL-Zertifikat nicht gefunden
**Lösung:**
```bash
# In Portainer Terminal des nginx Containers:
ls -la /etc/nginx/ssl/
# Sollte cert.pem und key.pem zeigen
```

### Problem: 502 Bad Gateway
**Lösung:**
1. **app Container** läuft?
2. **Netzwerk** korrekt?
3. **Port 3000** erreichbar?

### Problem: MongoDB verbindet nicht
**Lösung:**
- **mongo-init-replica** muss erfolgreich laufen
- **Warten** bis Replica Set initialisiert ist (30-60 Sekunden)

---

## 📱 PWA-Installation nach HTTPS

### Android Chrome:
```
1. https://217.154.223.78 öffnen
2. Zertifikat-Warnung akzeptieren
3. 3 Sekunden warten
4. Install-Banner erscheint
5. "Installieren" → Echte native App!
```

### iOS Safari:
```
1. https://217.154.223.78 öffnen
2. Zertifikat akzeptieren
3. Teilen-Button → "Zum Home-Bildschirm"
4. "Hinzufügen" → Native App installiert!
```

---

## 🎯 Endresultat

Nach erfolgreichem Setup hast du:

- ✅ **HTTPS** mit SSL-Verschlüsselung
- ✅ **Automatische HTTP→HTTPS** Weiterleitung  
- ✅ **PWA** mit echter App-Installation
- ✅ **Service Worker** voll funktionsfähig
- ✅ **Offline-Funktionalität**
- ✅ **Native App-Gefühl**

---

## 📞 Support

Falls Probleme auftreten:
1. **Container Logs** in Portainer überprüfen
2. **Browser-Konsole** auf Fehler prüfen
3. **Cache leeren** und neu versuchen

**Deine App läuft dann als echte PWA unter HTTPS! 🎉**
