# CHECKLIST — Fase 5 (Padronização Visual)

**Status:** Concluído ✅

**Início:** 04/07/2026

**Roadmap:** product/04-ROADMAP.md §1.11

**Plano:** plans/PLAN-006-padronizacao-visual.md

---

## Objetivo

Eliminar inconsistências visuais: criar ContratoCard, migrar tokens, corrigir
espaçamento e padronizar cards inline.

---

## Ordem de execução (zero retrabalho)

```
F1 (ContratoCard) → F2 (tokens + gap-3 + inline) → F3 (docs)
```

Nenhum arquivo é tocado mais de uma vez.

---

## F1 — Criar ContratoCard

**Complexidade:** Média
**Arquivos tocados:** 1 novo + 2 alterados
**Depende de:** —

### F1a — Criar ContratoCard.tsx

Criar `modules/contrato/components/ContratoCard.tsx`

Seguir o mesmo padrão de `ClienteCard.tsx`:
- Importar `Card`, `StatusBadge`, `formatCurrency`, `parseDateLocal`
- 2 variantes: `list-item` e `detail`
- API sem `as`, `to`, `loading`, `disabled`, `onClick`

### F1b — ContratoList.tsx

**Antes:** card inline com `Card.Root`, `Card.Title`, `Card.Body`, grid, StatusBadge

**Depois:**
```tsx
<Link key={c.id} to={`/contratos/${c.id}`} className="block">
  <ContratoCard variant="list-item" contrato={c} />
</Link>
```

### F1c — ContratoInfo.tsx

**Antes:** ~114 linhas com grids manuais, `<hr>`, labels

**Depois:**
```tsx
export function ContratoInfo({ contrato }: ContratoInfoProps) {
  return <ContratoCard variant="detail" contrato={contrato} />
}
```

### Critério de aceite (F1)

- [ ] Visual: ContratoList cards idênticos (nome, grid financeiro, parcela, status)
- [ ] Visual: ContratoDetail mantém resumo financeiro completo
- [ ] Clique no card navega para `/contratos/:id`
- [ ] `tsc --noEmit` limpo

---

## F2 — Limpeza geral

**Complexidade:** Média
**Arquivos tocados:** ~10 (alguns já alterados em F1)
**Depende de:** F1 (para evitar tocar ContratoInfo/ContratoList duas vezes)

### F2a — Migrar classes raw → tokens

| Arquivo | Substituições |
|---------|---------------|
| `RotaPage.tsx` | 6 (`bg-green-600` → `bg-success`, `bg-blue-500` → `bg-primary`, etc.) |
| `ParcelaList.tsx` | 8 (`bg-*-400` → `bg-*-DEFAULT`) |
| `PagamentosHojeModal.tsx` | 1 (`text-green-700` → `text-success-text`) |
| `ClienteEdit.tsx` | 3 (`bg-gray-200` → `bg-secondary`) |
| `ContratoNovo.tsx` | 1 (`hover:bg-gray-100` → `hover:bg-secondary-light`) |
| `OperacoesDashboard.tsx` | 2 (`bg-gray-100` → `bg-secondary-light`) |
| `ContratoList.tsx` | 2 (já alterado em F1, aplicar tokens no mesmo toque) |

### F2b — Corrigir gap-3 → gap-4

| Arquivo | Local |
|---------|-------|
| `PagamentoModal.tsx:213` | `flex gap-3` → `flex gap-4` |
| `OperacoesDashboard.tsx:94` | `grid grid-cols-2 gap-3` → `gap-4` |
| `IndicadoresCards.tsx:26` | `grid grid-cols-2 gap-3` → `gap-4` |
| `ClienteNovo.tsx:196` | `flex gap-3` → `flex gap-4` |
| `ClienteEdit.tsx:239` | `flex gap-3` → `flex gap-4` |
| `RotaPage.tsx:430,580,617` | 3x `gap-3` → `gap-4` |
| `CobrancaList.tsx:57` | `flex items-start gap-3` → `gap-4` |
| `ParcelaList.tsx:54` | `flex flex-wrap gap-3` → `gap-4` |

### F2c — Cards inline → Card.Root

| Arquivo | O que fazer |
|---------|-------------|
| `ContratoEdit.tsx:137-139` | `<div className="rounded-md bg-gray-50 p-3">` → `Card.Root variant="detail"` |
| `PagamentosHojeModal.tsx:51` | `<div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2">` → `Card.Root` |
| `RotaCobrancaSection.tsx:20` | `<div className="overflow-hidden rounded-md border border-gray-200 bg-white">` → `Card.Root variant="detail"` |

### Critério de aceite (F2)

- [ ] Cores visualmente equivalentes (tokens vs raw)
- [ ] Espaçamento sutilmente maior (12px → 16px)
- [ ] Nenhum layout quebrado
- [ ] `tsc --noEmit` limpo

---

## F3 — Atualizar documentação

**Complexidade:** Baixa
**Arquivos tocados:** ~4

- [ ] `04-UI-COMPONENTS.md` — ContratoCard: ⚠️ → ✅
- [ ] `05-MAPEAMENTO-TELAS.md` — ContratoCard: ⚠️ → ✅, contagem corrigida
- [ ] `plans/README.md` — PLAN-006: Aguardando → Concluído
- [ ] `04-ROADMAP.md` — §1.11 checklist atualizado

---

## Resumo

| # | Entrega | Arq. novos | Arq. alterados | Complexidade | Status |
|---|---------|-----------|----------------|--------------|--------|
| F1 | Criar ContratoCard + migrar consumers | 1 | 2 | Média | ✅ |
| F2 | Tokens + gap-3 + cards inline | 0 | ~10 | Média | ✅ |
| F3 | Atualizar documentação | 0 | ~4 | Baixa | ✅ |

---

## Referências

- `product/04-ROADMAP.md` §1.11
- `plans/PLAN-006-padronizacao-visual.md`
- `shared/components/Card/Card.tsx`
- `design/05-TOKEN.md`
- `plans/PLAN-005-cliente-card.md`
