# PLAN-006 — Padronização Visual (Tokens + ContratoCard)

## Objetivo

Eliminar inconsistências visuais remanescentes: criar ContratoCard como componente
de domínio, migrar classes raw para tokens semânticos, corrigir violações de
espaçamento e padronizar cards inline que ainda não usam Card.Root.

---

## Diagnóstico

| Problema | Severidade | Ocorrências |
|----------|-----------|-------------|
| ContratoCard não existe | Média | 0 (será criado) |
| ContratoInfo.tsx não usa `Card.Root` | Média | 1 arquivo (inline grids) |
| Classes raw em vez de tokens semânticos | Média | ~24 em 7 arquivos |
| `gap-3` (12px) fora da escala 8px | Baixa | 10 ocorrências |
| Cards inline sem `Card.Root` | Baixa | 3 (ContratoEdit, PagamentosHojeModal, RotaCobrancaSection) |

---

## Arquitetura

### Relação entre componentes

```
Página (ContratoList / ContratoDetail)
↓
ContratoCard (componente de domínio — apresentação)
├── variant="list-item" → clienteNome, valor, juros, parcelas, datas, status
└── variant="detail"    → saldo, recebido, valor, parcelas, juros, datas, status
↓
Card.Root, Card.Header, Card.Body (Design System — estrutura)
```

### API final

```tsx
interface ContratoCardProps {
  contrato: Contrato
  variant: "list-item" | "detail"
}
```

Sem `as`, `to`, `loading`, `disabled`, `onClick` — mesmo padrão do ClienteCard.

### Responsabilidades

Pode:
- exibir informações do contrato;
- escolher layout conforme variant;
- compor `Card.Root`, `Card.Header`, `Card.Body`, `Card.Title`;
- usar `StatusBadge` para exibir estado do contrato.

Não pode:
- conter regras de negócio;
- conter chamadas HTTP;
- conter navegação;
- controlar loading/disabled.

---

## Ordem de execução (zero retrabalho)

```
F1 (ContratoCard) → F2 (tokens + gap-3 + inline cards) → F3 (docs)
```

F1 cria o componente e mexe em ContratoInfo + ContratoList.
F2 aplica tokens e gap-3 nos mesmos arquivos + corrige cards inline restantes.
F3 atualiza documentação.

Nenhum arquivo é tocado mais de uma vez.

---

### F1 — Criar ContratoCard

#### 1a — Criar ContratoCard.tsx

Criar `modules/contrato/components/ContratoCard.tsx`

**Variante `list-item`:** substitui card inline em `ContratoList.tsx`
```
┌──────────────────────────────────┐
│ Nome do Cliente        (N1)      │ ← Card.Root variant="list-item"
│ Capital: R$ X  Juros: Y%        │
│ Saldo: R$ X    Total: R$ Y      │
│ Parcela 1/20 • Início → Fim     │
│                          [Ativo] │ ← StatusBadge
└──────────────────────────────────┘
```

**Variante `detail`:** substitui `ContratoInfo.tsx`
```
┌──────────────────────────────────┐
│ Resumo do Contrato    (header)   │ ← Card.Root variant="detail"
├──────────────────────────────────┤
│ Saldo Dev. R$ X   Rec. R$ Y     │
│ ──────────────────────────────── │
│ Valor Emp.  R$ X  Total R$ Y    │
│ Parcelas Nx        Valor R$ Y   │
│ Início data        Término data │
│ Juros X%              [Ativo]   │
│ [Ver Cliente]                    │
└──────────────────────────────────┘
```

#### 1b — ContratoList.tsx

Substituir card inline por:
```tsx
<Link key={c.id} to={`/contratos/${c.id}`} className="block">
  <ContratoCard variant="list-item" contrato={c} />
</Link>
```

#### 1c — ContratoInfo.tsx

Reduzir a wrapper:
```tsx
export function ContratoInfo({ contrato }: ContratoInfoProps) {
  return <ContratoCard variant="detail" contrato={contrato} />
}
```

---

### F2 — Limpeza geral (tokens + gap-3 + inline cards)

Executar em uma única passada nos arquivos já alterados e nos demais.

#### 2a — Migrar classes raw para tokens

| Arquivo | O quê | Token |
|---------|-------|-------|
| `RotaPage.tsx` | `bg-green-600` | `bg-success` |
| `RotaPage.tsx` | `bg-green-100 text-green-700` | `bg-success-light text-success-text` |
| `RotaPage.tsx` | `bg-blue-500` | `bg-primary` |
| `RotaPage.tsx` | `bg-gray-100 / hover:bg-gray-100` | `bg-secondary-light / hover:bg-secondary-light` |
| `ParcelaList.tsx` | `bg-green-400 / bg-blue-400 / bg-yellow-400 / bg-red-400 / bg-gray-300` | `bg-success / bg-info / bg-warning / bg-danger / bg-secondary` |
| `PagamentosHojeModal.tsx` | `text-green-700` | `text-success-text` |
| `ClienteEdit.tsx` | `bg-gray-200` | `bg-secondary` |
| `ContratoNovo.tsx` | `hover:bg-gray-100` | `hover:bg-secondary-light` |
| `ContratoList.tsx` | `hover:bg-gray-100` | `hover:bg-secondary-light` |
| `OperacoesDashboard.tsx` | `bg-gray-100` | `bg-secondary-light` |

#### 2b — Corrigir gap-3 → gap-4

| Arquivo | Local(is) |
|---------|-----------|
| `PagamentoModal.tsx` | 213 |
| `OperacoesDashboard.tsx` | 94 |
| `IndicadoresCards.tsx` | 26 |
| `ClienteNovo.tsx` | 196 |
| `ClienteEdit.tsx` | 239 |
| `RotaPage.tsx` | 430, 580, 617 |
| `CobrancaList.tsx` | 57 |
| `ParcelaList.tsx` | 54 |

#### 2c — Cards inline → Card.Root

| Arquivo | Hoje | Vira |
|---------|------|------|
| `ContratoEdit.tsx:137-139` | `div.rounded-md.bg-gray-50.p-3` nome do cliente | `Card.Root variant="detail"` |
| `PagamentosHojeModal.tsx:51` | `div.rounded-md.border.border-gray-100.bg-gray-50.px-3.py-2` | `Card.Root variant="detail"` compacto |
| `RotaCobrancaSection.tsx:20` | `div.overflow-hidden.rounded-md.border.border-gray-200.bg-white` | `Card.Root variant="detail"` |

---

### F3 — Atualizar documentação

| Documento | Ação |
|-----------|------|
| `04-ROADMAP.md` | §1.11 atualizado com checklist |
| `04-UI-COMPONENTS.md` | ContratoCard: ⚠️ → ✅ |
| `05-MAPEAMENTO-TELAS.md` | ContratoCard: ⚠️ → ✅, remover desatualizações |
| `plans/README.md` | PLAN-006: Aguardando → Concluído |
| `05-TOKEN.md` | Revisar se necessário |

---

## Referências

- `product/04-ROADMAP.md` §1.11
- `plans/PLAN-005-cliente-card.md` — Padrão de componente de domínio
- `shared/components/Card/Card.tsx` — Compound component do Card
- `design/05-TOKEN.md` — Design tokens
- `design/02-DESIGN-SYSTEM.md` §286-303 — Regras de cards
- `engineering/tasks/2026-07-04/CHECKLIST-FASE5.md` — Checklist executável
