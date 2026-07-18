# CHECKLIST — Fase 8 (Conceito de Atendimento)

**Status:** Concluído

**Início:** 05/07/2026

**Conclusão:** 11/07/2026

**Roadmap:** product/04-ROADMAP.md §1.14

**Plano:** plans/PLAN-009-conceito-atendimento.md

---

## Objetivo

Padronizar o conceito de Atendimento de Cobrança, substituindo o campo `visitadoEm`
pelo `resultadoOperacional` (PENDENTE, VISITADO, NAO_ENCONTRADO, PROMESSA)
em toda a stack, e sincronizar as listas via EventBus.

---

## Ordem de execução (zero retrabalho)

```
P0  →  P1  →  P2  →  P3+P4+P5+P6  →  P7  →  P8
```

P0 e P1 independentes. P2 depende de P1. P3-P6 consumidores de P2 (lote). P7 e P8 finais.

---

## P0 — Criar Event Bus

**Complexidade:** 🟢 Baixa
**Arquivos:** 1 novo (`shared/events/eventBus.ts`)

### O que fazer

Criar Event Bus singleton para comunicação entre módulos.

### Critério de aceite

- [x] `eventBus.emit("operacao:atualizada")` dispara listeners registrados com `eventBus.on`
- [x] `eventBus.on` retorna função unsubscribe
- [x] `tsc --noEmit` limpo

---

## P1 — Backend: adicionar resultadoOperacional

**Complexidade:** 🟡 Média
**Arquivos:** 1 alterado (`operacoes.repository.impl.ts`)

### O que fazer

1. Alterar a subquery `LEFT JOIN v` para retornar `resultadoOperacional`
2. Adicionar campo na interface `CobrancaRow`
3. Mapear no `.map()` final
4. Atualizar sort interno para usar `resultadoOperacional`

### Critério de aceite

- [x] Query retorna `resultadoOperacional` com valores `visitado | nao_localizado | promessa | null`
- [x] Sort preserva ordem: PENDENTE primeiro, depois os demais
- [x] `visitadoEm` continua funcionando para compatibilidade
- [x] `tsc --noEmit` limpo (backend)

---

## P2 — Frontend: tipo + constantes

**Complexidade:** 🟢 Baixa
**Arquivos:** 1 alterado (`operacoes.service.ts`)

### O que fazer

1. Criar `ResultadoOperacional as const` com os 4 valores
2. Adicionar `resultadoOperacional: ResultadoOperacionalType` ao `CobrancaItem`
3. Manter `visitadoEm` temporariamente

### Critério de aceite

- [x] `ResultadoOperacional.PENDENTE`, `.VISITADO`, `.NAO_ENCONTRADO`, `.PROMESSA` existem
- [x] `CobrancaItem.resultadoOperacional` é do tipo union
- [x] `tsc --noEmit` limpo

---

## P3 — CobrancaCard: badge por resultado

**Complexidade:** 🟢 Baixa
**Arquivos:** 1 alterado (`CobrancaCard.tsx`)

### O que fazer

1. Trocar prop `visitadoEm` por `resultadoOperacional`
2. Badge com variant/label conforme resultado

### Critério de aceite

- [x] PENDENTE → sem badge
- [x] VISITADO → badge neutral "Visitado"
- [x] NAO_ENCONTRADO → badge warning "Não Encontrado"
- [x] PROMESSA → badge info "Promessa"
- [x] `tsc --noEmit` limpo

---

## P4 — RotaPage: QuickActions condicionais

**Complexidade:** 🟢 Baixa
**Arquivos:** 1 alterado (`RotaPage.tsx`)

### O que fazer

1. Adicionar `show` nas QuickActions para ocultar botões já realizados
2. Atualizar `findIndex` nos handlers

### Critério de aceite

- [x] Se `resultadoOperacional === VISITADO`, botão "Visitado" não aparece
- [x] Se `resultadoOperacional === NAO_ENCONTRADO`, botão "Não Encontrado" não aparece
- [x] Se `resultadoOperacional === PROMESSA`, botão "Promessa" não aparece
- [x] Se `resultadoOperacional === PENDENTE`, todos os botões aparecem
- [x] `tsc --noEmit` limpo

---

## P5 — Sort/filter usar resultadoOperacional

**Complexidade:** 🟢 Baixa
**Arquivos:** 3 alterados (`RotaPage.tsx`, `CobrancaListPage.tsx`, `CobrancaList.tsx`)

### O que fazer

Substituir `!i.visitadoEm` / `i.visitadoEm` por comparações com `ResultadoOperacional.PENDENTE`.

### Critério de aceite

- [x] RotaPage separa itens por `resultadoOperacional === PENDENTE`
- [x] CobrancaListPage filtra por `resultadoOperacional === PENDENTE`
- [x] CobrancaList divide em pendentes/resolvidos por `resultadoOperacional`
- [x] `tsc --noEmit` limpo

---

## P6 — i18n: chaves dos resultados

**Complexidade:** 🟢 Baixa
**Arquivos:** 3 alterados (`pt-BR.json`, `en.json`, `es.json`)

### O que fazer

Adicionar `operacoes.resultado.{pendente,visitado,naoEncontrado,promessa}` em cada locale.

### Critério de aceite

- [x] pt-BR: Pendente, Visitado, Não Encontrado, Promessa
- [x] en: Pending, Visited, Not Found, Promise
- [x] es: Pendiente, Visitado, No Encontrado, Promesa
- [x] `tsc --noEmit` limpo

---

## P7 — Dashboard: ordenação consistente

**Complexidade:** 🟢 Baixa
**Arquivos:** 1 alterado (`OperacoesDashboard.tsx`)

### O que fazer

Separar pendentes + resolvidos (mesmo padrão da RotaPage).

### Critério de aceite

- [x] Pendentes aparecem antes de resolvidos no Carousel
- [x] Dentro de cada grupo, ordenação por situacao → distância é mantida
- [x] `tsc --noEmit` limpo

---

## P8 — Listas escutarem EventBus

**Complexidade:** 🟢 Baixa
**Arquivos:** 3 alterados (`RotaPage.tsx`, `OperacoesDashboard.tsx`, `CobrancaListPage.tsx`)

### O que fazer

1. Em RotaPage: emitir `operacao:atualizada` após cada registro bem-sucedido
2. Em Dashboard e CobrancaListPage: escutar evento e refetch

### Critério de aceite

- [x] RotaPage emite `operacao:atualizada` após "Visitado", "Não Encontrado" e "Promessa"
- [x] Dashboard refetch ao receber o evento
- [x] CobrancaListPage refetch ao receber o evento
- [x] `tsc --noEmit` limpo

---

## Resumo

| # | Entrega | Arquivos | Complexidade | Status |
|---|---------|----------|--------------|--------|
| P0 | Event Bus | 1 novo | 🟢 Baixa | ✅ |
| P1 | Backend: resultadoOperacional | 1 alt | 🟡 Média | ✅ |
| P2 | Frontend: tipo + constantes | 1 alt | 🟢 Baixa | ✅ |
| P3 | CobrancaCard: badge por resultado | 1 alt | 🟢 Baixa | ✅ |
| P4 | RotaPage: QuickActions condicionais | 1 alt | 🟢 Baixa | ✅ |
| P5 | Sort/filter usar resultadoOperacional | 3 alt | 🟢 Baixa | ✅ |
| P6 | i18n: chaves dos resultados | 3 alt | 🟢 Baixa | ✅ |
| P7 | Dashboard: ordenação consistente | 1 alt | 🟢 Baixa | ✅ |
| P8 | Listas escutarem EventBus | 3 alt | 🟢 Baixa | ✅ |
