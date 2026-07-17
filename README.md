# Nexus Platform

Sistema de gestão de cobranças em campo.

## Stack

**Backend:** Node.js + TypeScript + Express + SQLite (better-sqlite3 + Drizzle ORM)
**Frontend:** React + TypeScript + Vite + TailwindCSS + React Query + React Hook Form

## Estrutura

```
src/            — Backend (Express API)
frontend/       — Frontend (React SPA)
Documentação do Projeto/ — Documentação completa do projeto
```

## Pré-requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

## Rodando

```bash
# Backend (porta 3000)
npm run dev

# Frontend (em outro terminal)
cd frontend
npm run dev
```

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

A documentação completa do projeto está em [`Documentação do Projeto/docs/`](Documentação%20do%20Projeto/docs/README.md).
