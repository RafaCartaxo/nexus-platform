# PLAN-015 — Autenticação Multi-Usuário

**Status:** Planejado

**Versão:** 1.0

**Início:** 11/07/2026

**Roadmap:** product/04-ROADMAP.md §5.2

---

## Objetivo

Implementar autenticação JWT com isolamento total de dados por operador, garantindo que cada usuário do sistema acesse exclusivamente seus próprios registros.

---

## Diagnóstico

| Aspecto | Estado atual |
|---------|-------------|
| Autenticação | Zero — nenhum middleware, token, ou tabela de usuários |
| Tabelas com `userId` | Zero — todas as 10 tabelas são compartilhadas |
| Queries filtradas por usuário | Zero — ~60 queries sem filtro |
| Frontend | Sem login, sem contexto de auth, sem proteção de rota |

---

## Decisões de design

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Método de auth | JWT armazenado em localStorage | Stateless, compatível com PWA offline, simples para SQLite |
| Hash de senha | bcryptjs | Padrão seguro, compatível com Windows sem compilação nativa |
| Registro de operadores | Apenas admin (POST protegido) | Controle centralizado; sem auto-registro público |
| Senha inicial | Fixa, sem troca forçada no primeiro login | Simplicidade inicial; tela de perfil virá depois |
| Expiração do token | 7 dias | Balanço entre segurança e conveniência para uso diário |
| Fluxo ao expirar | Redirecionar para /login | Sem refresh token nesta versão |

---

## Tabelas com e sem `userId` direto

**Com `userId` (8 tabelas)** — diretamente consultadas nas queries principais:

| Tabela | Justificativa |
|--------|--------------|
| `clientes` | CRUD direto |
| `contratos` | CRUD direto + JOINs frequentes |
| `pagamentos` | Listagem direta por data |
| `movimentacoesFinanceiras` | Listagem direta por data/origem |
| `caixa_config` | Única por usuário (antes era singleton global) |
| `historico_operacional` | Registro de visitas do dia |
| `gastos` | CRUD direto |
| `fechamentos_semanais` | Histórico de fechamentos por usuário |

**Sem `userId` (2 tabelas)** — sempre acessadas via JOIN com a tabela pai:

| Tabela | Acessada via |
|--------|-------------|
| `parcelas` | `contratos.id` → `contratos.userId` |
| `pagamento_parcelas` | `pagamentos.id` → `pagamentos.userId` |

---

## Fases de implementação

```
Fase A (DB) → Fase B (Backend Auth) → Fase C (Backend Queries) → Fase D (Frontend)
```

---

### Fase A — Banco de Dados

**Arquivos:** 1 alterado (`src/database.ts`)

#### A.1 — Nova tabela `usuarios`

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senhaHash TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
)
```

#### A.2 — Coluna `userId` em 8 tabelas

```sql
ALTER TABLE clientes ADD COLUMN userId TEXT REFERENCES usuarios(id)
ALTER TABLE contratos ADD COLUMN userId TEXT REFERENCES usuarios(id)
ALTER TABLE pagamentos ADD COLUMN userId TEXT REFERENCES usuarios(id)
ALTER TABLE movimentacoesFinanceiras ADD COLUMN userId TEXT REFERENCES usuarios(id)
ALTER TABLE caixa_config ADD COLUMN userId TEXT REFERENCES usuarios(id)
ALTER TABLE historico_operacional ADD COLUMN userId TEXT REFERENCES usuarios(id)
ALTER TABLE gastos ADD COLUMN userId TEXT REFERENCES usuarios(id)
ALTER TABLE fechamentos_semanais ADD COLUMN userId TEXT REFERENCES usuarios(id)
```

Todas com `NOT NULL` após backfill.

#### A.3 — Usuário admin default

Inserido via migration: `admin@cobranca.com` com senha hash fixa. Em seguida, todas as tabelas existentes recebem `userId = admin.id`.

#### A.4 — Drizzle schema

Adicionar `usuarios` e `userId` aos schemas Drizzle correspondentes.

---

### Fase B — Backend: Módulo Auth

**Arquivos:** 9 novos + 2 alterados

#### B.1 — Novos arquivos

| Arquivo | Função |
|---------|--------|
| `src/modules/auth/domain/usuario.entity.ts` | Interface `Usuario`: id, nome, email, senhaHash, createdAt |
| `src/modules/auth/domain/errors/auth.error.ts` | `CredenciaisInvalidasError`, `EmailDuplicadoError` |
| `src/modules/auth/application/ports/auth.repository.ts` | `IAuthRepository`: `findByEmail`, `create`, `findById` |
| `src/modules/auth/infrastructure/repositories/auth.repository.impl.ts` | Implementação Drizzle |
| `src/modules/auth/application/use-cases/LoginUseCase.ts` | Validar email + bcrypt.compare, gerar JWT |
| `src/modules/auth/application/use-cases/RegistrarUseCase.ts` | Criar usuário (protegido, só admin) |
| `src/modules/auth/presentation/controllers/auth.controller.ts` | Handlers: `login`, `register`, `me` |
| `src/modules/auth/presentation/routes/auth.routes.ts` | Router com 3 endpoints |
| `src/shared/utils/jwt.ts` | `sign(payload): string`, `verify(token): payload` |
| `src/shared/middleware/auth.middleware.ts` | Extrai JWT do header `Authorization`, decodifica, injeta `req.userId` |

#### B.2 — Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/auth/login` | Não | `{ email, senha }` → `{ token, usuario }` |
| `POST` | `/api/auth/register` | Sim | `{ nome, email, senha }` → `Usuario` |
| `GET` | `/api/auth/me` | Sim | Retorna dados do usuário logado |

#### B.3 — Middleware em `main.ts`

```ts
app.use("/api/auth", authRoutes)        // público
app.use("/api", authMiddleware)          // protege todas as outras rotas
app.use("/api/clientes", clienteRoutes)
// ...
```

#### B.4 — Pacotes novos

`npm install jsonwebtoken bcryptjs` + `npm install -D @types/jsonwebtoken`

---

### Fase C — Backend: Filtrar queries por `userId`

**Arquivos:** ~38 alterados (todos os repositories, use cases, controllers)

#### C.1 — Padrão de injeção

```
middleware → req.userId → controller → use case → repository → WHERE userId = ?
```

#### C.2 — Por módulo

| Módulo | Repository | Use Cases | Controller | Arquivos |
|--------|-----------|-----------|------------|----------|
| `cliente` | 1 | 5 | 1 | 7 |
| `contrato` | 1 | 5 | 1 | 7 |
| `pagamento` | 1 | 4 | 1 | 6 |
| `operacoes` | 1 | 5 | 1 | 7 |
| `caixa` | 1 | 4 | 1 | 6 |
| `gasto` | 1 | 3 | 1 | 5 |

#### C.3 — Drizzle queries

Adicionar `eq(table.userId, params.userId)` ao `where` e `userId` nos `insert().values()`.

#### C.4 — Raw SQL queries

Adicionar `AND userId = ?` em cada `WHERE` + bind parameter.

#### C.5 — Migração do `caixa_config`

Antes: singleton global (`id = 'default'`). Depois: uma linha por usuário (`INSERT OR IGNORE INTO caixa_config (id, userId, caixaBase, updatedAt) VALUES ('default', ?, 0, datetime('now'))`).

---

### Fase D — Frontend

**Arquivos:** 4 novos + 5 alterados

#### D.1 — Novos arquivos

| Arquivo | Função |
|---------|--------|
| `src/modules/auth/services/auth.service.ts` | `login()`, `register()`, `getMe()` |
| `src/modules/auth/pages/LoginPage.tsx` | Formulário email + senha, chama `login()`, armazena token, redireciona para `/` |
| `src/shared/auth/AuthContext.tsx` | Provider com estado `{ user, token, login, logout, loading }` |
| `src/shared/auth/ProtectedRoute.tsx` | Verifica `token`; sem token → redireciona para `/login` |

#### D.2 — Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `src/api/client.ts` | Adicionar header `Authorization: Bearer ${token}` lendo de localStorage |
| `src/main.tsx` | Adicionar `<AuthProvider>` após `<QueryClientProvider>` |
| `src/App.tsx` | Rota `/login` (pública) + wrapper `<ProtectedRoute>` nas demais |
| `src/shared/components/Navbar.tsx` | Exibir nome do usuário + botão "Sair" |
| i18n (3 locales) | ~8 chaves: `auth.title`, `auth.email`, `auth.senha`, `auth.entrar`, `auth.sair`, `auth.erroLogin`, `auth.tokenExpirado` |

---

## APIs novas

### POST /api/auth/login

**Request:** `{ "email": "admin@cobranca.com", "senha": "********" }`  
**Response 200:** `{ "token": "eyJ...", "usuario": { "id": "...", "nome": "Admin", "email": "..." } }`  

### POST /api/auth/register

**Request:** `{ "nome": "Novo Operador", "email": "op@cobranca.com", "senha": "********" }`  
**Auth:** Sim (admin)  
**Response 201:** `{ "id": "...", "nome": "Novo Operador", "email": "op@cobranca.com", "createdAt": "..." }`  

### GET /api/auth/me

**Auth:** Sim  
**Response 200:** `{ "id": "...", "nome": "Admin", "email": "admin@cobranca.com" }`  

---

## Novas regras de negócio

| BR | Descrição |
|----|-----------|
| BR-055 | Cada operador possui login único (email + senha) |
| BR-056 | Dados isolados por operador — um operador nunca vê dados de outro |
| BR-057 | Apenas o administrador pode criar novos operadores |
| BR-058 | Token JWT expira em 7 dias; ao expirar, redireciona para login |

---

## i18n — Novas chaves

```json
{
  "auth": {
    "title": "Entrar",
    "email": "E-mail",
    "senha": "Senha",
    "entrar": "Entrar",
    "sair": "Sair",
    "erroLogin": "E-mail ou senha inválidos.",
    "tokenExpirado": "Sessão expirada. Faça login novamente."
  }
}
```

---

## Resumo de arquivos

| Fase | Novos | Alterados | Complexidade |
|------|-------|-----------|--------------|
| A — Database | 0 | 1 | 🟡 Média |
| B — Auth Backend | 9 | 2 | 🟡 Média |
| C — Queries userId | 0 | ~38 | 🔴 Alta |
| D — Frontend Auth | 4 | 5 | 🟡 Média |
| **Total** | **13** | **~46** | |

---

## Impacto sobre outras demandas

| Demanda | Conflito? |
|---------|-----------|
| Mapa (5.3) | Nenhum — clientes já terão userId |
| PWA (5.4) | Nenhum — JWT em localStorage é compatível com service worker |
| Testes (5.5) | Positivo — autenticação viabiliza testes com múltiplos usuários |

---

## Referências

- `product/04-ROADMAP.md` §5.2
- `product/02-BUSINESS-RULES.md` — BR-055 a BR-058
- `engineering/01-DATABASE.md`
- `engineering/02-API.md`
- `engineering/04-BACKEND.md`
- `engineering/03-FRONTEND.md`
