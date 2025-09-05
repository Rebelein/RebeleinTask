# 🚀 NGINX + SSL Quick Setup

## ⚡ Super Schnelle Anleitung (5 Minuten)

### 1. Aktuelle App stoppen
```
Portainer → Stacks → rebelleintask → Stop → Remove
```

### 2. Neue HTTPS Stack erstellen
```
Portainer → Stacks → Add Stack
Name: rebelleintask-ssl
Build method: Web editor
```

### 3. Konfiguration kopieren
**Kopiere den KOMPLETTEN Inhalt von `docker-compose.nginx-ssl.yml` in den Editor**

### 4. Deployen
```
Deploy the stack → Warten (3-5 Min)
```

### 5. Testen
```
https://217.154.223.78
→ Zertifikat-Warnung akzeptieren
→ PWA Install-Banner erscheint automatisch!
```

---

## 🔍 Was passiert automatisch:

1. **SSL-Zertifikat** wird generiert
2. **Nginx-Konfiguration** wird erstellt  
3. **HTTP→HTTPS** Weiterleitung aktiviert
4. **PWA** funktioniert mit echter Installation
5. **Service Worker** läuft vollständig

---

## 📱 Nach dem Setup:

**✅ HTTPS**: `https://217.154.223.78`
**✅ MongoDB**: `http://217.154.223.78:8081`  
**✅ PWA**: Automatische Installation verfügbar!

---

## 🎯 Endresultat:

- Echte App-Installation statt Verknüpfung
- Vollständig funktionsfähige PWA
- HTTPS-verschlüsselte Verbindung
- Native App-Erfahrung

**Zeitaufwand: ~5 Minuten** ⚡
