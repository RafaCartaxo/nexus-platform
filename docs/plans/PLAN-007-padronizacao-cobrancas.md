# PLAN-007 — Padronização de Cards de Cobrança e Inconsistências Visuais

## Objetivo

✅ **Concluído em 04/07/2026**

Eliminar inconsistências visuais nas telas operacionais (Dashboard, Rota,
PagamentoModal, ParcelaList), padronizar ícones de ações, extrair CobrancaCard
como componente de domínio, e remover violações do Design System (sombras,
cores fora da paleta, inputs com excesso de estilo).

---

## Diagnóstico completo

| # | Problema | Onde | Severidade |
|---|----------|------|-----------|
| F1 | Ícones faltando no CobrancaList (WhatsApp, Ligar, Abrir sem ícone) | `CobrancaList.tsx:80-82` | 🔴 Alta |
| F2 | CobrancaCard local, não compartilhado com RotaPage | `CobrancaList.tsx`, `RotaPage.tsx` | 🟡 Média |
| F3 | Botões Pagar/Visitado/Não Encontrado/Promessa são inline `<button>` | `RotaPage.tsx:472-512` | 🟡 Média |
| F4 | Cor `amber` fora da paleta de tokens | `PagamentoModal.tsx:189`, `RotaPage.tsx:507` | 🟡 Média |
| F5 | ParcelaList com `shadow` + `hover:shadow-md` (viola DS) | `ParcelaList.tsx:87` | 🟡 Média |
| F6 | ~20 inputs com `shadow-sm` em excesso | ClienteNovo, ClienteEdit, ContratoNovo, ContratoEdit | 🔵 Baixa |
| F7 | Cabeçalhos inconsistentes (gray-400, text-base) | `CobrancaList.tsx:122`, `RotaCobrancaSection.tsx:24` | 🔵 Baixa |

---

## Arquitetura

### CobrancaCard (F2)

```
Dashboard / RotaPage
↓
CobrancaCard (componente de domínio — apresentação)
├── variant="compact" → nome, dot, valor, parcelas, distância, StatusBadge, QuickActions
└── variant="detail"  → nome, dot, valor, parcelas, distância, StatusBadge (sem ações)
↓
Card.Root, Card.Dot, Card.Body, Card.Header, Card.Title (Design System)
```

### API proposta

```tsx
interface CobrancaCardProps {
  clienteNome: string
  totalPendente: number
  quantidadeParcelas: number
  situacao: string
  visitadoEm?: string | null
  distancia?: number | null
  variant: "compact" | "detail"
  // compact inclui QuickActions internamente
  // detail expõe apenas dados, RotaPage gerencia botões externamente
  onNavigate?: () => void
  onWhatsApp?: () => void
  onLigar?: () => void
  onAbrir?: () => void
}
```

### Botões da RotaPage (F3)

Após extrair CobrancaCard, a RotaPage mantém apenas:
- Loading bar (animação)
- **CobrancaCard variant="detail"** (dados do cliente)
- **Botão Pagar** → migrar para `Button` component
- **Ações de visita** (Visitado, Não Encontrado, Promessa) → avaliar se vira `QuickActions`

---

## Ordem de execução (zero retrabalho)

```
F1 → F4 → F5 → F6 → F7 → F2 → F3
```

As correções simples (F1, F4-F7) vêm primeiro. Depois a extração do componente
(F2) que mexe em CobrancaList + RotaPage. Por último a padronização dos botões
da RotaPage (F3) que aproveita o CobrancaCard já extraído.

Nenhum arquivo é tocado mais de uma vez.

---

### F1 — Adicionar ícones faltando no CobrancaList

**Arquivo:** `CobrancaList.tsx`

**Mudanças:**
- Importar `MessageCircle`, `Phone`, `FileText` de `lucide-react`
- Adicionar `icon: MessageCircle`, `icon: Phone`, `icon: FileText` nas actions de WhatsApp, Ligar, Abrir

**Antes:**
```tsx
{ label: t("operacoes.whatsapp"), onClick: handleWhatsApp, variant: "green" },
{ label: t("operacoes.ligar"), onClick: handleLigar, variant: "blue" },
{ label: t("operacoes.abrir"), onClick: handleAbrirContrato, variant: "gray" },
```

**Depois:**
```tsx
{ icon: MessageCircle, label: t("operacoes.whatsapp"), onClick: handleWhatsApp, variant: "green" },
{ icon: Phone, label: t("operacoes.ligar"), onClick: handleLigar, variant: "blue" },
{ icon: FileText, label: t("operacoes.abrir"), onClick: handleAbrirContrato, variant: "gray" },
```

---

### F4 — Amber → tokens warning

**Arquivos:** `PagamentoModal.tsx`, `RotaPage.tsx`

| Onde | Classe raw | Token |
|------|-----------|-------|
| `PagamentoModal.tsx:189` | `bg-amber-400` | `bg-warning` |
| `RotaPage.tsx:507` | `text-amber-700 hover:bg-amber-50` | `text-warning-text hover:bg-warning-light` |

---

### F5 — ParcelaList: remover sombra

**Arquivo:** `ParcelaList.tsx:87`

**Antes:**
```tsx
className={`group flex min-w-0 flex-col overflow-hidden rounded-md border p-3 shadow transition-shadow hover:shadow-md ${getCardEstilo(p)}`}
```

**Depois:**
```tsx
className={`group flex min-w-0 flex-col overflow-hidden rounded-md border p-3 transition hover:border-blue-300 ${getCardEstilo(p)}`}
```

---

### F6 — Inputs: remover shadow-sm

**Arquivos:** ClienteNovo, ClienteEdit, ContratoNovo, ContratoEdit

**Antes:**
```tsx
className="mt-1 block w-full rounded-md border px-3 py-2 text-base shadow-sm focus:border-blue-500..."
```

**Depois:**
```tsx
className="mt-1 block w-full rounded-md border px-3 py-2 text-base focus:border-blue-500..."
```

> **Nota:** Remover apenas `shadow-sm` de cada input. Manter `focus:ring-2 focus:ring-blue-500` que já está presente em alguns.

---

### F7 — Cabeçalhos inconsistentes

| Onde | Antes | Depois |
|------|-------|--------|
| `CobrancaList.tsx:122` "Visitados" | `text-lg font-semibold text-gray-400` | `text-lg font-semibold text-gray-500` |
| `RotaCobrancaSection.tsx:24` título | `text-base font-semibold text-gray-800` | `text-lg font-semibold text-gray-800` |

---

### F2 — Extrair CobrancaCard

**Arquivo novo:** `modules/operacoes/components/CobrancaCard.tsx`

Extrair o pattern de dados compartilhado entre CobrancaList e RotaPage:
- nome do cliente
- dot (vermelho/azul conforme situação)
- valor pendente
- parcelas
- distância
- StatusBadge (atrasado/vence hoje)

**Variante `compact`:**
```
┌──────────────────────────────────┐
│ ● Nome                    [Ações]│ ← Card.Root variant="collection"
│   R$ valor · N parcelas         │  Card.Dot + Card.Body + Card.Actions
│   ~X km  [Atrasado]             │
└──────────────────────────────────┘
```

**Variante `detail`:**
```
┌──────────────────────────────────┐
│ ● NOME                    [Vis.]│ ← Card.Root variant="collection"
│   R$ VALOR                      │  Card.Dot + Card.Body (sem Card.Actions)
│   N parcelas · ~X km            │  RotaPage adiciona botões externamente
│   [Atrasado]                    │
└──────────────────────────────────┘
```

---

### F3 — Padronizar botões da RotaPage

**Arquivo:** `RotaPage.tsx`

Após F2, a RotaPage terá:
1. `CobrancaCard variant="detail"` (dados)
2. Botão **Pagar** → migrar de `<button>` inline para `Button` component com `className` verde
3. Ações **Visitado / Não Encontrado / Promessa** → avaliar:
   - Se comportam como ações rápidas → `QuickActions layout="horizontal"`
   - Se forem únicas da rota → manter como `Button` component

---

## Resumo

| Fase | O quê | Arquivos | Esforço | Status |
|------|-------|----------|---------|--------|
| F1 | Ícones no CobrancaList | 1 | 🔵 Muito baixo | ✅ |
| F4 | Amber → tokens | 2 | 🔵 Muito baixo | ✅ |
| F5 | ParcelaList sem sombra | 1 | 🔵 Baixo | ✅ |
| F6 | Inputs sem shadow-sm | 4 | 🔵 Baixo | ✅ |
| F7 | Cabeçalhos consistentes | 2 | 🔵 Muito baixo | ✅ |
| F2 | Criar CobrancaCard | 1 novo + 2 alt | 🟡 Médio | ✅ |
| F3 | Botões RotaPage padronizados | 1 | 🟡 Médio | ✅ |

---

## Referências

- `product/04-ROADMAP.md` §1.12
- `design/02-DESIGN-SYSTEM.md` §Cards — regras de sombra
- `shared/components/Card/Card.tsx` — Compound component
- `shared/components/QuickActions/QuickActions.tsx` — Ações rápidas
- `engineering/tasks/2026-07-04/CHECKLIST-FASE6.md` — Checklist executável
