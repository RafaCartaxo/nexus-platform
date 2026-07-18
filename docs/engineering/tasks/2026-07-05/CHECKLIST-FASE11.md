# CHECKLIST — Fase 11 (Resumo Operacional da Rota)

**Status:** Concluído

**Início:** 05/07/2026

**Roadmap:** product/04-ROADMAP.md §1.17

**Plano:** plans/PLAN-012-resumo-operacional-rota.md

---

## Objetivo

Evoluir a barra de progresso da Rota de Cobrança adicionando resumo detalhado
dos resultados operacionais (visitados, promessas, não encontrados, pagos).

---

## P1 — RouteProgress: novas props + layout

**Arquivos:** 1 alterado (`RouteProgress.tsx`)

### O que fazer

1. Adicionar props: `visitados`, `promessas`, `naoEncontrados`, `pagos`
2. Manter barra de progresso + contagem de pendentes
3. Adicionar linhas de resumo com ícones e contagens

### Critério de aceite

- [ ] Barra de progresso continua funcionando
- [ ] "X Pendentes" exibido abaixo da barra
- [ ] 4 linhas de resumo: Visitados, Promessas, Não encontrados, Pagos
- [ ] `tsc --noEmit` limpo

---

## P2 — RotaPage: fetch pagamentos + contagens

**Arquivos:** 1 alterado (`RotaPage.tsx`)

### O que fazer

1. Adicionar estado `pagamentosHoje`
2. Criar `fetchPagamentos` (reaproveita `listarPagamentosHoje`)
3. Calcular `routeVisitados`, `routePromessas`, `routeNaoEncontrados`, `routePagos`
4. Passar para RouteProgress

### Critério de aceite

- [ ] `routePagos` = número de clientes únicos que pagaram hoje
- [ ] Contagens atualizam automaticamente (EventBus + pagamentos fetch)
- [ ] Falha no fetch de pagamentos não quebra a página
- [ ] `tsc --noEmit` limpo

---

## P3 — i18n

**Arquivos:** 3 alterados (`pt-BR.json`, `en.json`, `es.json`)

### O que fazer

1. Adicionar `resumo.pagos` nos 3 locales
2. Reaproveitar chaves `resultado.*` para visitado, promessa, não encontrado

### Critério de aceite

- [ ] `resumo.pagos` presente nos 3 locales
- [ ] `tsc --noEmit` limpo

---

## Resumo

| # | Entrega | Arquivos | Complexidade | Status |
|---|---------|----------|--------------|--------|
| P1 | RouteProgress: novas props + layout | 1 alt | 🟢 Baixa | ✅ |
| P2 | RotaPage: fetch pagamentos + contagens | 1 alt | 🟢 Baixa | ✅ |
| P3 | i18n: `resumo.pagos` | 3 alt | 🟢 Baixa | ✅ |
