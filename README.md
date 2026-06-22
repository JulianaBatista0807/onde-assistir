# Onde Assistir

Aplicação para descobrir **onde assistir** filmes e séries no Brasil. Combina uma API REST (Node.js + Express + MongoDB), autenticação JWT, busca integrada ao [TMDB](https://www.themoviedb.org/) e um front-end estático em HTML/CSS/JS.

**Repositório:** https://github.com/JulianaBatista0807/onde-assistir

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack tecnológica](#stack-tecnológica)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração](#configuração)
- [Como rodar](#como-rodar)
- [Front-end](#front-end)
- [API](#api)
- [Testes](#testes)
- [Integração Contínua (CI)](#integração-contínua-ci)
- [Swagger](#swagger)
- [Solução de problemas](#solução-de-problemas)

---

## Funcionalidades

- Cadastro e login de usuários com JWT
- Perfil do usuário autenticado
- Busca de filmes e séries via TMDB (título, sinopse, poster)
- Exibição de plataformas de streaming no Brasil (assinatura, alugar, comprar)
- Documentação interativa com Swagger
- Pipeline de CI com GitHub Actions (push, manual e agendada)

---

## Stack tecnológica

| Camada | Tecnologias |
|--------|-------------|
| Backend | Node.js, Express 5, Mongoose |
| Autenticação | JWT, bcryptjs |
| Banco de dados | MongoDB (Atlas ou local) |
| Busca de títulos | API TMDB + dados JustWatch (região BR) |
| Front-end | HTML, CSS e JavaScript (vanilla) |
| Testes | Jest, jest-junit |
| CI/CD | GitHub Actions |

---

## Estrutura do projeto

```
onde-assistir/              ← repositório Git (este diretório)
├── .github/workflows/      ← pipeline CI
├── src/
│   ├── config/             ← env, conexão MongoDB
│   ├── controllers/
│   ├── middleware/
│   ├── models/             ← User, Title
│   ├── routes/
│   ├── services/           ← auth, TMDB, busca
│   └── utils/
├── scripts/seedTitles.js   ← seed opcional (legado)
├── server.js
└── swagger.yaml

frontend/                   ← front-end (pasta irmã, um nível acima)
├── login.html
├── register.html
├── home.html
├── css/
└── js/
```

O Express serve os arquivos de `frontend/` automaticamente quando a pasta existe no caminho `../frontend` em relação a este repositório.

---

## Pré-requisitos

- **Node.js** 18+ (recomendado 20+)
- **MongoDB** local ou [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Chave TMDB** gratuita para a busca de títulos ([obter aqui](https://www.themoviedb.org/settings/api))

---

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o arquivo `.env`

```bash
# Windows
copy .env.example .env

# Linux/macOS
cp .env.example .env
```

### 3. Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `MONGODB_URI` | Sim | Connection string do MongoDB |
| `JWT_SECRET` | Sim | Segredo para assinar tokens JWT |
| `TMDB_API_KEY` | Sim* | Chave da API TMDB (*obrigatória para busca) |
| `PORT` | Não | Porta do servidor (padrão: `3000`) |
| `JWT_EXPIRES_IN` | Não | Validade do token (padrão: `7d`) |
| `TMDB_REGION` | Não | Região de streaming (padrão: `BR`) |
| `TMDB_LANGUAGE` | Não | Idioma dos metadados (padrão: `pt-BR`) |
| `CORS_ORIGIN` | Não | Origens permitidas (padrão: `*`) |

**Exemplo `.env`:**

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/onde-assistir
JWT_SECRET=um-segredo-forte-aqui
TMDB_API_KEY=sua_chave_tmdb
TMDB_REGION=BR
TMDB_LANGUAGE=pt-BR
```

### TMDB — como obter a chave

1. Crie uma conta em [themoviedb.org](https://www.themoviedb.org/signup)
2. Acesse **Settings → API** e solicite uma API Key (plano Developer, gratuito)
3. Cole o valor em `TMDB_API_KEY` no `.env`

> O TMDB é a principal base de metadados do setor, mas **não é um catálogo oficial universal**. A disponibilidade de streaming vem da parceria TMDB + JustWatch e pode variar por região e data.

### Seed local (opcional)

```bash
npm run seed
```

Insere 30 títulos de exemplo no MongoDB. **A busca do app usa o TMDB**, não essa coleção.

---

## Como rodar

```bash
# Produção
npm start

# Desenvolvimento (auto-reload)
npm run dev
```

Com o servidor no ar:

- API: `http://localhost:3000/api/health`
- Swagger: `http://localhost:3000/docs`
- Front-end: `http://localhost:3000/login.html`

---

## Front-end

Interface básica com fluxo de **cadastro → login → busca de títulos → logout**.

| Página | Descrição |
|--------|-----------|
| `login.html` | Entrada com e-mail e senha |
| `register.html` | Cadastro de novo usuário |
| `home.html` | Perfil + busca de filmes/séries |
| `index.html` | Redireciona conforme sessão |

### Opção A — mesmo servidor (recomendado)

1. Garanta que a pasta `frontend/` existe em `../frontend` (relativo a este repo)
2. Execute `npm run dev`
3. Acesse `http://localhost:3000/login.html`

### Opção B — servidor estático separado

```bash
npx serve ../frontend -p 5500
```

Altere `API_BASE` em `frontend/js/config.js` para `http://localhost:3000/api`.

---

## API

### Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/health` | Não | Health check |
| `POST` | `/api/auth/register` | Não | Cadastro |
| `POST` | `/api/auth/login` | Não | Login |
| `GET` | `/api/users/me` | Bearer | Perfil do usuário |
| `GET` | `/api/titles/search` | Bearer | Busca filmes/séries |

### Autenticação

Envie o token JWT no header:

```
Authorization: Bearer <accessToken>
```

Login e cadastro retornam:

```json
{
  "user": { "id": "...", "name": "...", "email": "..." },
  "accessToken": "...",
  "expiresAt": "2026-06-29T12:00:00.000Z"
}
```

### Busca de títulos

```
GET /api/titles/search?q=matrix&type=movie&limit=10
```

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `q` | Sim | Termo de busca (mín. 2 caracteres) |
| `type` | Não | `movie` ou `series` |
| `limit` | Não | Máximo de resultados (padrão 20, máx. 20) |

**Resposta de exemplo:**

```json
{
  "query": "matrix",
  "total": 1,
  "region": "BR",
  "source": "tmdb",
  "results": [
    {
      "id": "movie-603",
      "tmdbId": 603,
      "title": "Matrix",
      "type": "movie",
      "year": 1999,
      "synopsis": "...",
      "posterUrl": "https://image.tmdb.org/t/p/w342/...",
      "providers": [
        { "name": "Netflix", "type": "subscription" }
      ]
    }
  ]
}
```

### Erros

Respostas de erro seguem o formato:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Search query must have at least 2 characters"
  }
}
```

---

## Testes

```bash
# Testes locais
npm test

# Simular execução da CI (cobertura + relatório JUnit)
CI=true npm run test:ci          # Linux/macOS
$env:CI='true'; npm run test:ci # Windows PowerShell
```

Com `CI=true`, o relatório XML é gerado em `reports/junit.xml`.

**Suítes cobertas:** autenticação (`authService`, `authController`), busca (`titleService`, `tmdbService`).

---

## Integração Contínua (CI)

Pipeline definida em [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

### Gatilhos

| Gatilho | Evento | Quando executa |
|---------|--------|----------------|
| Push | `push` | Commits em `main`, `master` ou `feat/**` |
| Manual | `workflow_dispatch` | Botão **Run workflow** na aba Actions |
| Agendado | `schedule` | Segunda-feira às 06:00 UTC |

### Fluxo

```mermaid
flowchart LR
  trigger[Push / Manual / Schedule] --> checkout[Checkout]
  checkout --> node[Node.js 20]
  node --> install[npm ci]
  install --> tests[npm run test:ci]
  tests --> publish[Relatório JUnit]
  tests --> artifact[Artefatos]
```

1. Checkout do código
2. Instalação com `npm ci`
3. Execução de `npm run test:ci` (Jest + cobertura + JUnit)
4. Publicação do resultado nos **GitHub Checks**
5. Upload dos artefatos `test-report-*` e `coverage-report-*` (retenção: 30 dias)

### Executar manualmente

1. Acesse [Actions](https://github.com/JulianaBatista0807/onde-assistir/actions)
2. Selecione o workflow **CI**
3. Clique em **Run workflow**

### Evidência de execução

Exemplo de run bem-sucedida:  
https://github.com/JulianaBatista0807/onde-assistir/actions/runs/27922575713

### Conceitos aplicados

- **Integração Contínua (CI)** — validação automática a cada alteração
- **Pipeline as Code** — workflow versionado em YAML
- **Fail fast** — pipeline falha se algum teste falhar
- **Artefatos** — relatórios persistidos além do log do job
- **Ambiente reprodutível** — `npm ci` + variáveis fixas na pipeline

Na CI, os testes usam mocks e **não dependem** de MongoDB ou TMDB reais.

---

## Swagger

Documentação interativa da API:

- **UI:** http://localhost:3000/docs
- **JSON:** http://localhost:3000/docs.json

---

## Solução de problemas

### `npm run dev` não sobe — erro de MongoDB

```
MongooseServerSelectionError: Could not connect to any servers...
```

**Causas comuns:**

1. **IP não liberado no Atlas** — em Network Access, adicione seu IP atual ou `0.0.0.0/0` (apenas dev) e aguarde status **Active**
2. **Connection string incorreta** — recopie em Atlas → Database → Connect → Drivers (`mongodb+srv://...`)
3. **Credenciais erradas** — use usuário/senha de Database Access, não o login do site Atlas
4. **Typo no nome do banco** — confira se a URI aponta para `onde-assistir`

### Busca retorna erro 503 (`TMDB_NOT_CONFIGURED`)

Configure `TMDB_API_KEY` no `.env` e reinicie o servidor.

### Porta 3000 em uso (`EADDRINUSE`)

```powershell
netstat -ano | findstr :3000
```

Encerre o processo ou altere `PORT=3001` no `.env`.

### Front-end não abre

Confirme que a pasta `frontend/` existe em `../frontend` (relativo a este repositório) ou use a Opção B com servidor estático separado.

---

## Licença

ISC
