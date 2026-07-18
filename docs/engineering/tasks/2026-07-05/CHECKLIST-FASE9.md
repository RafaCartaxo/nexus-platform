# CHECKLIST — Fase 9 (Fila Operacional de Cobrança)

**Status:** Concluído

**Início:** 05/07/2026

**Conclusão:** 11/07/2026

**Roadmap:** product/04-ROADMAP.md §1.15

**Plano:** plans/PLAN-010-barra-progresso.md

---

## Objetivo

Transformar a Rota de Cobrança, a lista Cobranças do Dia e o Dashboard em filas operacionais,
exibindo exclusivamente clientes pendentes. Qualquer atendimento registrado remove
imediatamente o cliente da fila.

---

## Ordem de execução (zero retrabalho)

```
P0 → P1 → P2 → P3 → P4
```

---

## P0 — Carousel: props de suporte

**Arquivos:** 1 alterado (`Carousel.tsx`)

### O que fazer

1. Adicionar `hideDots?: boolean` — oculta bolinhas
2. Adicionar `maxDots?: number` — limita bolinhas visíveis + exibe "X de Y"
3. Adicionar `itemKey?: (item: T) => string` — key única para animação

### Critério de aceite

- [ ] `hideDots` funcional no slide e scroll
- [ ] `maxDots=5` mostra 5 bolinhas móveis
- [ ] `itemKey` usado como key do slide para trigger de animação
- [ ] `tsc --noEmit` limpo

---

## P1 — RouteProgress component

**Arquivos:** 1 novo (`modules/operacoes/components/RouteProgress.tsx`)

### O que fazer

Componente de apresentação.

Props: `total`, `completed`, `pending`

Renderiza:
- Barra de progresso `(completed / total) * 100%`
- "✓ X atendidos • Y pendentes"

### Critério de aceite

- [ ] Barra de progresso proporcional
- [ ] Resumo atualiza automaticamente via React re-render
- [ ] `tsc --noEmit` limpo

---

## P2 — RotaPage: só PENDENTE na fila

**Arquivos:** 1 alterado (`RotaPage.tsx`)

### O que fazer

1. `sortedItems` = apenas `pendentes` (remover `sortedVisitados`)
2. `routeTotal` / `routeCompleted` / `routePending` derivados do `items` completo
3. Carrossel com `hideDots` + `itemKey`
4. RouteProgress abaixo do Carrossel

### Critério de aceite

- [ ] Carrossel exibe apenas clientes PENDENTE
- [ ] Após registrar visita, cliente some da fila
- [ ] Progresso (`✓ X atendidos • Y pendentes`) reflete total + completos
- [ ] `tsc --noEmit` limpo

---

## P3 — Cobranças: simplificar lista + remover filtros

**Arquivos:** 2 alterados (`CobrancaListPage.tsx`, `CobrancaList.tsx`)

### O que fazer

1. Remover filtros [Todos/Pendentes/Visitados] da página
2. Passar apenas PENDENTE para a lista
3. Remover split naoVisitados/visitados do componente — lista plana

### Critério de aceite

- [ ] Cobranças do Dia exibe apenas clientes PENDENTE
- [ ] Sem seções "Visitados" na lista
- [ ] Após visita, item some da lista (com EventBus)
- [ ] `tsc --noEmit` limpo

---

## P4 — Dashboard: só PENDENTE

**Arquivos:** 1 alterado (`OperacoesDashboard.tsx`)

### O que fazer

1. `itemsOrdenados` = apenas `pendentes` (remover `resolvidos`)
2. Carrossel com `maxDots={5}`

### Critério de aceite

- [ ] Dashboard exibe apenas clientes PENDENTE
- [ ] Após visita, item some do Dashboard (com EventBus)
- [ ] Bolinhas limitadas a 5
- [ ] `tsc --noEmit` limpo

---

## Resumo

| # | Entrega | Arquivos | Complexidade | Status |
|---|---------|----------|--------------|--------|
| P0 | Carousel: props de suporte | 1 alt | 🟢 Baixa | ✅ |
| P1 | RouteProgress component | 1 novo | 🟢 Baixa | ✅ |
| P2 | RotaPage: só PENDENTE | 1 alt | 🟢 Baixa | ✅ |
| P3 | Cobranças: simplificar | 2 alt | 🟢 Baixa | ✅ |
| P4 | Dashboard: só PENDENTE | 1 alt | 🟢 Baixa | ✅ |
