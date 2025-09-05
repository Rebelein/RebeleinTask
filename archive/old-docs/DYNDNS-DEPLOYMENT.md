# DynDNS + Let's Encrypt Deployment Anleitung

## ✅ Bereits erledigt:
- ✅ DuckDNS Account erstellt (goettfert.florian@gmail.com)
- ✅ Domain registriert: `rebelleintask.duckdns.org`
- ✅ Token generiert: `de3aa6cf-bf20-4b8c-b367-149bf463ba48`
- ✅ IP-Adresse gesetzt: `91.16.154.238`

## 🚀 Deployment Schritte:

### 1. Aktuelle Container stoppen
```bash
# Falls noch alte Container laufen
docker-compose -f docker-compose.working-https.yml down
docker-compose down
```

### 2. DynDNS + Let's Encrypt starten
```bash
cd /path/to/your/project
docker-compose -f docker-compose.dyndns-letsencrypt.yml up -d
```

### 3. Logs überwachen
```bash
# Alle Services
docker-compose -f docker-compose.dyndns-letsencrypt.yml logs -f

# Nur Traefik (für SSL-Zertifikat)
docker logs traefik_letsencrypt -f

# Nur DuckDNS Updater
docker logs duckdns_updater -f

# Nur App
docker logs rebelleintask_app_dyndns -f
```

### 4. Status prüfen
```bash
# Container Status
docker-compose -f docker-compose.dyndns-letsencrypt.yml ps

# Traefik Dashboard (optional)
# http://217.154.223.78:8080
```

## 🌐 URLs nach Deployment:

- **Hauptapp (HTTPS)**: https://rebelleintask.duckdns.org
- **Auto-Redirect**: http://rebelleintask.duckdns.org → https://rebelleintask.duckdns.org
- **Mongo Express**: http://217.154.223.78:8081 (admin/admin)
- **Traefik Dashboard**: http://217.154.223.78:8080

## 🔍 Troubleshooting:

### DNS Check
```bash
# IP-Adresse der Domain prüfen
nslookup rebelleintask.duckdns.org
dig rebelleintask.duckdns.org
```

### SSL-Zertifikat Check
```bash
# Zertifikat-Details anzeigen
openssl s_client -connect rebelleintask.duckdns.org:443 -servername rebelleintask.duckdns.org
```

### DuckDNS manuell updaten
```bash
# Falls IP sich geändert hat
curl "https://www.duckdns.org/update?domains=rebelleintask&token=de3aa6cf-bf20-4b8c-b367-149bf463ba48&ip=217.154.223.78"
```

## ⚠️ Wichtige Hinweise:

1. **Erste Zertifikat-Erstellung**: Kann 1-5 Minuten dauern
2. **Let's Encrypt Limits**: 50 Zertifikate pro Woche pro Domain
3. **DNS Propagation**: Kann bis zu 24h dauern (meist wenige Minuten)
4. **Ports**: 80 und 443 müssen öffentlich erreichbar sein
5. **Firewall**: Ports 80, 443 in der Firewall freigeben

## 🎯 Erfolg prüfen:

1. `https://rebelleintask.duckdns.org` öffnen
2. Grünes Schloss im Browser (vertrauenswürdiges Zertifikat)
3. PWA Installation verfügbar (+ Symbol in der Adressleiste)
4. Service Worker lädt ohne Fehler

## 🔄 Updates:

```bash
# App-Update (neuen Code pullen)
docker-compose -f docker-compose.dyndns-letsencrypt.yml pull app
docker-compose -f docker-compose.dyndns-letsencrypt.yml up -d app

# Komplettes Update
docker-compose -f docker-compose.dyndns-letsencrypt.yml pull
docker-compose -f docker-compose.dyndns-letsencrypt.yml up -d
```

## 📞 Support:

- **DuckDNS Status**: https://www.duckdns.org/
- **Let's Encrypt Status**: https://letsencrypt.status.io/
- **Traefik Docs**: https://doc.traefik.io/traefik/
