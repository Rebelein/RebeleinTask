# RebeleinTask - Portainer Fix für Image-Problem

## Problem
Der Fehler `denied` beim Zugriff auf `ghcr.io/v2/rebelein/rebelleintask/manifests/latest` tritt auf, weil das GitHub Container Registry Image privat ist.

## 🔧 Lösung 1: Verwende Build statt Image

Kopiere diese `docker-compose.yml` in Portainer (Web Editor):

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
    ports:
      - "3000:3000"
    depends_on:
      - mongo
    restart: unless-stopped
    networks:
      - rebelleintask_network

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

networks:
  rebelleintask_network:
    driver: bridge
```

## 🔧 Lösung 2: Manuelles Repository Setup

1. **In Portainer**: Stacks → Add Stack
2. **Name**: `rebelleintask`
3. **Build method**: **Web editor**
4. **Paste** die obige YAML-Datei
5. **Deploy the stack**

## ⏱️ Hinweis
Der erste Build kann 5-10 Minuten dauern, da das Image direkt aus dem GitHub-Repository gebaut wird.

## 🔧 Lösung 3: Lokales Build (Alternative)

Falls das nicht funktioniert, kannst du auch lokal builden:

```bash
git clone https://github.com/Rebelein/RebeleinTask.git
cd RebeleinTask
docker-compose up -d
```

## 🎯 Nach dem Deploy verfügbar unter:
- Anwendung: http://localhost:3000
- MongoDB Admin: http://localhost:8081
