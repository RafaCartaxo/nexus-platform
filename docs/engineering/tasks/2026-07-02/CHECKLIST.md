# Componentização — Checklist 02/07/2026

**Status:** Concluído ✅

**Objetivo:** Extrair 7 componentes inline para `shared/`, eliminando duplicação,
garantindo consistência visual e `tsc --noEmit` limpo.

**Modelo de entrega:** Cada entrega é atômica e verificável. A próxima só começa
após `tsc --noEmit` + verificação visual da anterior. Dependências explícitas
evitam retrabalho.

---

## Ordem de execução (linear)

```
0 ✅ → 1 → 2 → 3 → 4 → 5 → 6 → 7a → 7b → 7c → 7d → 7e → 8 → 9
                                 ↗ 7a depende de 1 (StatusBadge)
```

---

## Entrega 0 — Design Tokens

**Depende de:** —  
**Complexidade:** Baixa  
**Arquivos tocados:** 1

- [x] Adicionar cores semânticas no `tailwind.config.js`: `primary`, `success`, `warning`, `danger`, `info`, `secondary`
- [x] Verificar: classes raw (`blue-600`, `green-100`) continuam funcionando
- [x] Verificar: `npx tailwindcss --help` reconhece os tokens
- [x] `tsc --noEmit` limpo

---

## Entrega 1 — StatusBadge

**Depende de:** Entrega 0  
**Complexidade:** Baixa  
**Arquivos tocados:** ~12 (1 novo + 6 páginas alteradas)

**Por que primeiro?** É o mais repetido (8+ badges inline) e o Card (Entrega 7)
usa StatusBadge via `Card.Badge`.

### Criar

- [x] `shared/components/StatusBadge/StatusBadge.tsx`

```tsx
// Props
variant: "success" | "warning" | "danger" | "info" | "neutral"
label: string

// Classes por variante (usando tokens):
// success → bg-success-light text-success-text
// warning → bg-warning-light text-warning-text
// danger  → bg-danger-light  text-danger-text
// info    → bg-info-light    text-info-text
// neutral → bg-gray-100      text-gray-500

// Render: rounded-full px-2 py-0.5 text-xs font-medium
```

### Mapeamento de estados → variantes

| Estado | Variante |
|--------|----------|
| Paga, Ativo, Finalizado, Quitado | `success` |
| Pendente, Parcial | `warning` |
| Atrasado, Vencida | `danger` |
| Vence Hoje | `info` |
| Visitado, Em Andamento | `neutral` |

### Substituir (8 badges, 5 arquivos)

- [x] `CobrancaList.tsx:63-67` → badge "Visitado" → `variant="neutral"`
- [x] `CobrancaList.tsx:73-81` → badge situacao → `variant="danger"` ou `"info"`
- [x] `RotaPage.tsx:387-391` → badge GPS → mantido inline (tem ícone `<MapPin>`)
- [x] `RotaPage.tsx:437-443` → badge situacao → `variant="danger"` ou `"info"` (dot indicator, não badge)
- [x] `RotaPage.tsx:447-450` → badge "Visitado" → `variant="neutral"`
- [x] `RotaPage.tsx:462-470` → badge situacao (grande) → `size="md"`
- [x] `ContratoList.tsx:244-254` → badge estado → `variant="success"` ou `"info"`
- [x] `ContratoInfo.tsx:100-108` → badge estado → `variant="success"` ou `"info"`

> **Achado durante implementação:** `RotaPage.tsx:462-470` é o mesmo badge de situacao
> que `RotaPage.tsx:437-443` com tamanho `md`. Ambos substituídos. Referência duplicada
> no checklist — as 2 linhas apontam para o mesmo badge em contextos diferentes.

### Não coberto nesta entrega (intencional)

- **GPS badge** (`RotaPage.tsx:389-392`): mantido inline — usa ícone `<MapPin>`.
  StatusBadge não suporta `icon`. Se necessário no futuro, adicionar prop `icon?: LucideIcon`.
- **Dot indicators** (`h-3/h-4 w-3/w-4 rounded-full`): são indicadores visuais de cor,
  não badges de texto. Permanecerão como `<span>` inline.
- **PagamentoModal** / **PagamentosHojeModal**: não possuem badges de texto — apenas
  dots visuais e listas de valores.

### Verificação

- [x] `tsc --noEmit` limpo
- [x] Visual: badges renderizam com as mesmas variantes lógicas e cores equivalentes
  via tokens do design system.
  > Nota: `danger-text` mudou de `red-700` → `red-800` (#991B1B) conforme TOKEN.md.
  > Diferença sutil (~8%) e alinhada com o design system oficial.
- [x] Tokens: componentes usam `bg-success-light`, `text-success-text`, etc.

---

## Entrega 2 — ErrorBanner

**Depende de:** Entrega 1  
**Complexidade:** Baixa  
**Arquivos tocados:** ~9 (1 novo + 6 páginas alteradas)

### Criar

- [x] `shared/components/ErrorBanner/ErrorBanner.tsx`

```tsx
// Props
message: string
onRetry?: () => void
onDismiss?: () => void

// Render: rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700
// Se onRetry: exibe botão "Tentar novamente"
// Se onDismiss: exibe botão X para fechar
```

### Substituir (7 locais, 7 arquivos)

- [x] `OperacoesDashboard.tsx:87-93` → com `onRetry={fetch}`
- [x] `RotaPage.tsx:420-423` → `message={error}` (sem retry)
- [x] `ClienteNovo.tsx:118-122` → `message={erro}` (sem retry)
- [x] `ClienteEdit.tsx:167-171` → `message={erro}` (sem retry)
- [x] `ContratoNovo.tsx:151-155` → `message={erro}` (sem retry)
- [x] `ContratoEdit.tsx:146-150` → `message={erro}` (sem retry)
- [x] `ContratoDetail.tsx:132-136` → `message={erroAcao}` (sem retry)

### Verificação

- [x] `tsc --noEmit` limpo
- [x] Dashboard: banner com botão "Tentar novamente" funcional
- [x] Formulários: banner sem botão
- [ ] Fechar (X) funciona quando `onDismiss` é passado (nenhum local usa `onDismiss` atualmente)

> **Achado durante implementação:** 7 banners encontrados (não 5). `ClienteEdit.tsx` e
> `ContratoEdit.tsx` também tinham banners inline não listados originalmente. Todos
> substituídos.

---

## Entrega 3 — SectionHeader

**Depende de:** Entrega 2  
**Complexidade:** Baixa  
**Arquivos tocados:** ~6 (1 novo + 6 seções em 4 arquivos)

### Criar

- [x] `shared/components/SectionHeader/SectionHeader.tsx`

```tsx
// Props
title: string
action?: { label: string; onClick: () => void }

// Render: div.flex > h2 text-xl font-semibold text-gray-800
// Se action: botão ao lado direito
```

### Substituir (6 locais, 4 arquivos)

- [x] `ClienteNovo.tsx:125` → `<SectionHeader title={t("cliente.dadosCliente")} />`
- [x] `ClienteNovo.tsx:178` → `<SectionHeader title={t("cliente.endereco")} />`
- [x] `ClienteEdit.tsx:174` → `<SectionHeader title={t("cliente.dadosCliente")} />`
- [x] `ClienteEdit.tsx:227` → `<SectionHeader title={t("cliente.endereco")} />`
- [x] `ContratoNovo.tsx:157` → `<SectionHeader title={t("contrato.clienteLabel")} />`
- [x] `ContratoEdit.tsx:159` → `<SectionHeader title={t("contrato.condicoes")} />`

### Verificação

- [x] `tsc --noEmit` limpo
- [x] Títulos renderizam idênticos
- [ ] Seções com action mantêm botão funcional (nenhum local usa `action` atualmente)

---

## Entrega 4 — SearchBar

**Depende de:** Entrega 3  
**Complexidade:** Baixa  
**Arquivos tocados:** ~3 (1 novo + 2 páginas alteradas)

### Criar

- [x] `shared/components/SearchBar/SearchBar.tsx`

```tsx
// Props
value: string
onChange: (value: string) => void
placeholder?: string
onClear?: () => void

// Render: div relative > Search icon absolute left-3 + input pl-10
// Input: w-full rounded-md border border-gray-300 py-2 pl-10 pr-3
//        text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500
```

### Substituir (2 locais, 1 arquivo — escopo reduzido)

- [x] `ClienteList.tsx:65-73` → `<SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={t("...")} />`

### Verificação

- [x] `tsc --noEmit` limpo
- [x] Search icon, pl-10, focus ring mantidos
- [x] Debounce (300ms) da ClienteList continua funcionando
- [x] `onClear?` opcional — renderiza botão X quando `value` não vazio

---

## Entrega 5 — KpiCard

**Depende de:** Entrega 4  
**Complexidade:** Baixa  
**Arquivos tocados:** ~3 (1 novo + 2 alterados)

### Criar

- [x] `shared/components/KpiCard/KpiCard.tsx`

```tsx
// Props
title: string
value: ReactNode
variant: "blue" | "green" | "yellow" | "gray"
onClick?: () => void
valueClassName?: string   // opcional, para override da cor do valor

// Variantes:
// blue   → bg-blue-50,  label blue-600, value blue-800,  hover:bg-blue-100
// green  → bg-green-50, label green-600,value green-800, hover:bg-green-100
// yellow → bg-yellow-50,label yellow-600,value yellow-800,hover:bg-yellow-100
// gray   → bg-gray-50,  label gray-600, value gray-700,  (sem hover)

// Render: wrapper dinâmico: <button> se onClick, <div> caso contrário
//         rounded-md p-4 text-left
//         título: text-xs font-medium uppercase tracking-wider
//         valor:  mt-1 text-2xl font-bold
```

### Refatorar (1 arquivo)

- [x] `IndicadoresCards.tsx` → compor com 4 `<KpiCard>`, mantendo props originais

### Verificação

- [x] `tsc --noEmit` limpo
- [x] Dashboard: 4 KPIs renderizam idênticos
- [x] KPIs clicáveis mantêm cursor-pointer e hover
- [x] KPI resultadoDoDia mantém cor verde/vermelha via `valueClassName`

---

## Entrega 6 — QuickActions

**Depende de:** Entrega 5  
**Complexidade:** Média  
**Arquivos tocados:** ~4 (1 novo + 3 alterados)

### Criar

- [x] `shared/components/QuickActions/QuickActions.tsx`

```tsx
// Props
actions: Array<{
  icon?: LucideIcon
  label: string
  onClick: () => void
  variant?: "blue" | "green" | "gray"
  show?: boolean         // para renderização condicional
}>
layout?: "horizontal" | "vertical"
disabled?: boolean

// Horizontal (CobrancaList pattern):
//   container: flex flex-shrink-0 flex-wrap gap-1
//   botão: rounded px-2 py-1 text-xs font-medium
//   variantes: text-blue-700 hover:bg-blue-50, etc.
//   ícone inline se presente (h-3.5 w-3.5), senão só label

// Vertical (RotaPage pattern):
//   container: flex gap-2
//   botão: flex flex-1 flex-col items-center gap-1 rounded-md px-1 py-3 text-xs font-medium
//   variantes: bg-blue-50 text-blue-700 hover:bg-blue-100, etc.
//   ícone acima do label (h-5 w-5)
```

### Substituir (2 locais, 2 arquivos)

- [x] `CobrancaList.tsx:84-117` → `<QuickActions layout="horizontal" actions={[...]} />`
  - Ações: Navegar (blue), WhatsApp (green), Ligar (blue), Abrir (gray)
- [x] `RotaPage.tsx:475-515` → `<QuickActions layout="vertical" actions={[...]} disabled={operando} />`
  - Ações: Navegar (blue), WhatsApp (green), Ligar (blue), Abrir (gray)

### Verificação

- [x] `tsc --noEmit` limpo
- [x] CobrancaList: 4 botões inline, mesmo layout e cores
- [x] RotaPage: 4 botões verticais, mesmo layout e cores
- [x] `disabled` desabilita todos os botões
- [x] Handlers (WhatsApp, ligar, navegar, abrir) continuam funcionando

---

## Entrega 7 — Card

**Depende de:** Entrega 6 + Entrega 1 (StatusBadge via `Card.Badge`)  
**Complexidade:** Alta  
**Sub-entregas:** 5 (7a → 7e, executar em sequência)

### 7a — Criar estrutura base

**Arquivos:** 1 (novo)

- [x] `shared/components/Card/Card.tsx` — compound structure criada

### 7b — Criar Card.Indicators, Card.Actions, Card.Badge

- [x] `Card.Indicators` → container de indicadores (flex/grid)
- [x] `Card.Indicator` → label + value (texto secundário)
- [x] `Card.Actions` → delega para `<QuickActions>` internamente
- [x] `Card.Badge` → delega para `<StatusBadge>` internamente

### 7c — Substituir list-item

- [x] `ClienteList.tsx:86-99` → `<Card.Root variant="list-item" as="link">`
- [x] `ContratoList.tsx:208-258` → `<Card.Root variant="list-item" as="link">`
  - [x] `hover:bg-gray-50` → removido (Card.Root aplica `hover:border-blue-300`)

### 7d — Substituir detail

- [x] `ClienteInfo.tsx:21-37` → `<Card.Root variant="detail">`
  - [x] Comércio `text-base font-medium` → `text-sm text-gray-500` (N1→N3)
- [x] `SaldoInfo.tsx:13-29` → `<Card.Root variant="detail">`

### 7e — Substituir collection

- [x] `CobrancaCard` (CobrancaList.tsx) → `<Card.Root variant="collection">`
- [x] `RotaPage.tsx:434-561` → `<Card.Root variant="collection">`

### Verificação final

- [x] `tsc --noEmit` limpo
- [x] `ContratoList` hover mudou de `bg-gray-50` para `border-blue-300` ✅
- [x] `ClienteInfo` Comércio desceu de N1 para N3 visual ✅
- [x] Cards de coleção mantêm dot, badges, indicadores e ações ✅

---

## Entrega 8 — Limpeza de código morto

**Depende de:** Entrega 7 (todas as substituições concluídas)  
**Complexidade:** Baixa  
**Arquivos tocados:** ~15 (todos os tocados nas entregas anteriores)

- [x] Verificar ContratoInfo: badge de estado — layout OK (será reestruturado pelo Card)
- [x] Remover imports não utilizados em todos os arquivos alterados
  - ContratoList: `import { X } from "lucide-react"` separado → consolidado em uma linha com `ChevronLeft, ChevronDown, X`
  - Demais arquivos: todos os imports permanecem em uso
- [x] Remover `CobrancaCard` — mantido como função que usa `Card.Root` internamente (não duplicado)
- [x] Remover badges inline — apenas GPS badge (intencional, tem ícone)
- [x] Remover inputs de busca inline — 0 ocorrências fora de shared/
- [x] Remover h2 de seção inline — 0 ocorrências
- [x] Remover banners de erro inline — apenas em ErrorBanner.tsx (shared/)
- [x] Remover quick actions inline — 0 ocorrências
- [x] Remover IndicadoresCards — mantido como composição de 4 `<KpiCard>` (wrapper do módulo)

### Verificação

- [x] `tsc --noEmit` limpo — **ZERO erros**
- [x] `grep` — badge inline fora de shared/: apenas GPS badge (intencional, checklist § "Não coberto")
- [x] `grep` — ErrorBanner inline fora de shared/: 0 resultados ✅
- [x] `grep` — SearchBar inline fora de shared/: 0 resultados ✅

---

## Entrega 9 — Atualização de documentação

**Depende de:** Entrega 8  
**Complexidade:** Baixa  
**Arquivos tocados:** ~3

### 9a — `04-UI-COMPONENTS.md`
- [x] StatusBadge: status ⚠️ → ✅
- [x] ErrorBanner: status ⚠️ → ✅
- [x] SectionHeader: status ⚠️ → ✅
- [x] SearchBar: status ⚠️ → ✅
- [x] KpiCard: status ⚠️ → ✅
- [x] QuickActions: status ⚠️ → ✅
- [x] Card: status ⚠️ → ✅
- [x] Versão atualizada para 1.2

### 9b — `05-MAPEAMENTO-TELAS.md`
- [x] Atualizar árvore de componentes com os 7 novos shared
- [x] Adicionar referência a `06-UI-PATTERNS.md`
- [x] Adicionar referência a `CHECKLIST.md`
- [x] Atualizar versão para v1.2

### 9c — `INDEX.md`
- [x] Verificar links para documentos atualizados — todos presentes e corretos
- [x] Nenhuma atualização necessária

### Verificação

- [x] Todos os links entre documentos funcionam
- [x] Status dos componentes no catálogo reflete realidade do código

---

## Resumo das entregas

| # | Componente | Arq. novo | Arq. alterados | Complexidade |
|---|-----------|-----------|---------------|--------------|
| 0 | Design Tokens | 1 | 0 | Baixa |
| 1 | StatusBadge | 1 | 6 | Baixa |
| 2 | ErrorBanner | 1 | 5 | Baixa |
| 3 | SectionHeader | 1 | 4 | Baixa |
| 4 | SearchBar | 1 | 2 | Baixa |
| 5 | KpiCard | 1 | 2 | Baixa |
| 6 | QuickActions | 1 | 3 | Média |
| 7 | Card | 1 | 6 | Alta |
| 8 | Código morto | 0 | 1 | Baixa |
| 9 | Documentação | 0 | 2 | Baixa |

**Total:** 8 novos arquivos, ~47 alterações, 9 entregas atômicas

---

## Pendências (fora do escopo)

| Item | Status |
|------|--------|
| Feedback Global (`PLAN-004`) | Planejado — conflita com `Button.loading` atual |
| Módulo Caixa (BR-018 a BR-027) | Não implementado |
| Módulo Gasto (BR-028) | Não implementado |
| react-hook-form + zod | 4 formulários ainda usam `useState` manual |
| DropdownFilter (inputs em dropdowns) | Padrão separado da SearchBar |

---

## Referências

- `product/04-ROADMAP.md` — Roadmap oficial do projeto
- `engineering/design/04-UI-COMPONENTS.md` — Catálogo de componentes
- `engineering/design/06-UI-PATTERNS.md` — Padrões de composição e anti-patterns
- `engineering/design/02-DESIGN-SYSTEM.md` — Identidade visual
- `engineering/05-MAPEAMENTO-TELAS.md` — Mapeamento das 10 telas
- `engineering/03-FRONTEND.md` — Arquitetura do frontend
- `plans/PLAN-004-feedback.md` — Sistema global de feedback
