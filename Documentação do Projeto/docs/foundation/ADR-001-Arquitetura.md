# ADR-001 — Arquitetura Base do Projeto

**Status:** Aprovado

**Versão:** 1.1

**Data:** 27/06/2026

---

# Contexto

O projeto será desenvolvido inicialmente como um MVP, mas deverá possuir arquitetura suficiente para crescer de forma organizada sem exigir reestruturações significativas.

A arquitetura deve equilibrar simplicidade, organização e facilidade de manutenção.

---

# Decisão

O projeto adotará uma arquitetura composta por:

- Modular Monolith;
- DDD Lite;
- Clean Layers;
- Use Case Driven Application;
- Ports & Adapters entre Application e Infrastructure.

Essa combinação busca maximizar legibilidade, desacoplamento e facilidade de evolução, mantendo a complexidade compatível com o porte do sistema.

---

# Objetivos

- Facilitar manutenção.
- Reduzir acoplamento.
- Organizar o código por domínio.
- Permitir evolução incremental.
- Facilitar entendimento por novos desenvolvedores e ferramentas de IA.

---

# Stack Tecnológica

## Linguagem

TypeScript

---

## Backend

- Node.js
- Express

---

## Frontend

As decisões de arquitetura do frontend foram movidas para o ADR-002 — Arquitetura do Frontend.

---

## Banco de Dados

SQLite

A arquitetura deverá permitir migração futura para PostgreSQL sem alterações significativas na lógica de negócio.

---

## ORM

Drizzle ORM

---

## Validação

Zod

---

## Testes

Vitest

---

## Bibliotecas previstas

Mapa

- Leaflet

Gráficos

- Chart.js

---

# Arquitetura

O sistema será dividido em módulos independentes.

Exemplo:

- Clientes
- Contratos
- Parcelas
- Pagamentos
- Caixa
- Dashboard
- Gastos
- Mapa

Cada módulo deverá possuir sua própria organização interna.

---

# Estrutura do Backend

Cada módulo poderá conter:

- Presentation (Controllers, DTOs)
- Application (Use Cases, Ports)
- Domain (Entities, Value Objects, Domain Services)
- Infrastructure (Repositories, Mappers)

Novas camadas somente serão adicionadas quando houver necessidade real.

Use Cases substituem a antiga camada de Service, garantindo responsabilidade única por operação.

---

# Estrutura do Frontend

Cada módulo deverá conter sua própria organização.

Exemplo:

- View
- Service
- Components
- Styles

O frontend será responsável apenas por:

- Apresentação.
- Navegação.
- Captura de eventos.
- Comunicação com a API.

Toda regra de negócio permanecerá no backend.

---

# Organização

A organização do projeto seguirá o domínio do negócio.

Não serão criadas estruturas baseadas apenas em tipo de arquivo.

---

# Shared

Todo código reutilizável deverá ser movido para um módulo compartilhado.

Exemplos:

- Helpers
- Constantes
- Tipagens
- Utilitários
- Middlewares
- Componentes reutilizáveis

---

# Código

O código deverá priorizar:

- Clareza
- Leitura
- Simplicidade

Arquivos muito extensos devem ser revisados e divididos quando estiverem acumulando múltiplas responsabilidades.

---

# Regras

Nenhuma regra de negócio deverá existir no frontend.

Toda movimentação financeira deverá ser registrada por meio das entidades apropriadas definidas pelo domínio.

Toda alteração arquitetural deverá gerar uma nova ADR.

---

# Consequências

## Benefícios

- Fácil manutenção.
- Baixo acoplamento.
- Crescimento organizado.
- Melhor suporte ao TypeScript.
- Melhor suporte para ferramentas de IA.
- Facilidade para futuras migrações.

## Trade-offs

- Maior quantidade de arquivos.
- Organização inicial mais trabalhosa.
- Exige disciplina para manter o padrão arquitetural.

Os benefícios superam os custos para este projeto.

---

# Decisão Final

Este projeto adotará como princípios técnicos:

- Modular Monolith.
- TypeScript em todo o projeto.
- Backend com Express.
- SQLite como banco inicial.
- Frontend leve e modular.
- Separação clara entre apresentação e regras de negócio.
- Evolução incremental baseada em documentação e ADRs.