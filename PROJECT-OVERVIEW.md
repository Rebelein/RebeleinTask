# 🎯 REBELLEINTASK - PROJEKT ÜBERSICHT

## ✅ **AKTUELLER STACK (PRODUKTIV):**

### 🚀 **Live-Anwendung:**
- **URL**: https://rebelleintask.duckdns.org
- **SSL**: Let's Encrypt (vertrauenswürdig)
- **PWA**: Smartphone & Desktop Installation verfügbar

### 🛠️ **Verwaltung:**
- **Portainer**: https://217.154.223.78:9443 (admin/RebeleinGoettfert2017)
- **Mongo Express**: http://217.154.223.78:8081 (admin/RebeleinGoettfert2017)
- **Traefik Dashboard**: http://217.154.223.78:8080

## 📁 **PROJEKT STRUKTUR:**

### 🔧 **Hauptdateien:**
- `docker-compose.yml` - **AKTUELLE** Portainer-Konfiguration
- `Dockerfile` - Container-Build-Definition
- `package.json` - Next.js Abhängigkeiten
- `PORTAINER-DEPLOYMENT-FINAL.md` - **HAUPTANLEITUNG**

### 📱 **Anwendungs-Code:**
- `src/` - Next.js Quellcode
- `public/` - Statische Dateien & PWA-Icons
- `components.json` - shadcn/ui Konfiguration

### 📚 **Dokumentation:**
- `README.md` - Projekt-Beschreibung
- `PWA-INSTALLATION.md` - PWA Setup Anleitung
- `docs/` - Technische Dokumentation

### 🗃️ **Archiv:**
- `archive/old-docker-configs/` - Veraltete Docker-Konfigurationen
- `archive/old-docs/` - Veraltete Dokumentationen

## 🎯 **DEPLOYMENT-WORKFLOW:**

### 1️⃣ **Code-Änderungen:**
```bash
# Lokale Entwicklung
npm run dev

# Code-Quality prüfen
npm run lint

# Git-Workflow
git add .
git commit -m "Beschreibung"
git push origin main
```

### 2️⃣ **Portainer Update:**
1. Portainer öffnen: https://217.154.223.78:9443
2. Stacks → "rebelleintask-live"
3. "Update the stack" + **"Re-deploy" ✅**
4. 5-10 Minuten warten

### 3️⃣ **Überwachung:**
- Container-Logs in Portainer prüfen
- App-Erreichbarkeit testen
- SSL-Zertifikat Status prüfen

## 🔧 **WICHTIGE BEFEHLE:**

### **Lokale Entwicklung:**
```bash
npm install
npm run dev
npm run build
npm run lint
```

### **Docker (falls benötigt):**
```bash
docker-compose up -d
docker-compose logs -f app
docker-compose down
```

## 📱 **PWA-FEATURES:**
- ✅ Smartphone Installation
- ✅ Offline-Funktionalität
- ✅ Push-Benachrichtigungen
- ✅ App-Store ähnliche Navigation

## ⚠️ **TROUBLESHOOTING:**
- **PWA-Probleme**: Browser-Cache leeren, Inkognito-Modus
- **SSL-Probleme**: Traefik-Logs prüfen
- **Build-Probleme**: ESLint-Fehler beheben
- **Verbindungsprobleme**: DuckDNS-Status prüfen

---

**🎉 Projekt erfolgreich aufgeräumt und strukturiert!**
