# Nexus Platform

Sistema de gestão de cobranças em campo.

## Stack

**Backend:** Node.js + TypeScript + Express + SQLite (better-sqlite3 + Drizzle ORM)
**Frontend:** React + TypeScript + Vite + TailwindCSS + React Query + React Hook Form

## Estrutura

```
src/                          — Backend (Express API)
frontend/                     — Frontend (React SPA)
Documentação do Projeto/docs/ — Documentação completa do projeto
scripts/                      — Scripts utilitários
api-collection.json           — Coleção Postman com todos os endpoints
```

## Pré-requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
git clone https://github.com/RafaCartaxo/nexus-platform.git
cd nexus-platform

# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

O banco de dados SQLite (`gestao.db`) é criado automaticamente na primeira execução — não requer configuração.

## Configuração

Variáveis de ambiente são opcionais no momento (os defaults bastam). Para customizar, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3000` | Porta do servidor backend |
| `DB_PATH` | `gestao.db` | Caminho do banco SQLite |

## Rodando

```bash
# Backend (porta 3000)
npm run dev

# Frontend (em outro terminal)
cd frontend
npm run dev
```

A API estará em `http://localhost:3000/api`. Importe `api-collection.json` no Postman para explorar os endpoints.

## Build

```bash
# Backend
npm run build

# Frontend
cd frontend
npm run build
```

## Testes

```bash
npm test
```

## Documentação

A documentação completa do projeto está em [`docs/`](docs/README.md). Consulte também o [guia de contribuição](docs/CONTRIBUTING.md).
