# Onde Assistir API

API REST em Node.js (JavaScript) com Express, autenticação JWT e MongoDB.

## Requisitos

- Node.js 18+ (recomendado 20+)
- MongoDB (local ou remoto)

## Setup

1. Instale dependências

```bash
npm install
```

2. Crie o arquivo `.env` (baseado no exemplo)

```bash
copy .env.example .env
```

3. Ajuste as variáveis no `.env` (principalmente `MONGODB_URI` e `JWT_SECRET`)

## Rodando

- **Modo estático**

```bash
npm start
```

- **Modo desenvolvimento (auto-reload)**

```bash
npm run dev
```

## Testes

```bash
npm test
```

## Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me` (Bearer token)

### Login

- **200**: retorna `accessToken` e `expiresAt` (ISO 8601)

## Swagger

- UI: `/docs`
- JSON: `/docs.json`

## Estrutura de pastas

- `src/routes`
- `src/middleware`
- `src/controllers`
- `src/models`
- `src/services`

