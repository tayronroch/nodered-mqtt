# Node-RED MQTT - Automação de Datacenter

Sistema de automação para coleta de dados de geradores e inversores de datacenter utilizando Node-RED e MQTT.

## Stack

- **Node-RED** - Plataforma de automação e orquestração de fluxos
- **Mosquitto** - Broker MQTT para comunicação entre dispositivos

## Configuração

1. Copie o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

2. Gere o hash bcrypt da senha do admin:

   Via Docker (não precisa de Node.js local):
   ```bash
   docker run --rm -it node:20-alpine -e "require('bcryptjs').hash('sua-senha-aqui', 8).then(console.log)"
   ```

   Ou com Node.js instalado localmente:
   ```bash
   node -e "require('bcryptjs').hash('sua-senha-aqui', 8).then(console.log)"
   ```

   Copie o hash gerado (ex: `$2a$08$xyz...`) e cole no `.env`.

3. Preencha as variáveis no `.env`:
   - `NODE_RED_ADMIN_PASSWORD_HASH` - Hash gerado no passo anterior
   - `DOMAIN` - Domínio de acesso (ex: `https://nodered.exemplo.com`)

4. Suba os containers:
   ```bash
   docker compose up -d
   ```

## Acesso

- **Node-RED**: porta `1880`
- **MQTT**: porta `1883` (TCP) / `9001` (WebSocket)
