# CHECKLIST — Fase 6 (Padronização de Cobranças)

**Status:** Concluído

**Início:** 04/07/2026

**Roadmap:** product/04-ROADMAP.md §1.12

**Plano:** plans/PLAN-007-padronizacao-cobrancas.md

---

## Objetivo

Eliminar inconsistências visuais em telas operacionais: ícones de ações,
cores fora da paleta, sombras em cards, inputs com excesso de estilo,
cabeçalhos inconsistentes, e extrair CobrancaCard como componente de domínio.

---

## Ordem de execução (zero retrabalho)

```
F1 → F4 → F5 → F6 → F7 → F2 → F3
```

Correções simples primeiro, extração do componente depois, botões da RotaPage por último.

---

## F1 — Adicionar ícones no CobrancaList

**Complexidade:** Muito baixa
**Arquivos:** 1

### O que fazer

Em `CobrancaList.tsx`:
1. Adicionar imports: `MessageCircle`, `Phone`, `FileText` de `lucide-react`
2. Adicionar `icon: MessageCircle` na action WhatsApp (linha 80)
3. Adicionar `icon: Phone` na action Ligar (linha 81)
4. Adicionar `icon: FileText` na action Abrir (linha 82)

### Critério de aceite

- [x] CobrancaList (Dashboard) mostra os 4 botões com ícones consistentes com RotaPage
- [x] `tsc --noEmit` limpo

---

## F4 — Amber → tokens warning

**Complexidade:** Muito baixa
**Arquivos:** 2

### O que fazer

| Arquivo | Local | Antes | Depois |
|---------|-------|-------|--------|
| `PagamentoModal.tsx` | 189 | `bg-amber-400` | `bg-warning` |
| `RotaPage.tsx` | 507 | `text-amber-700 hover:bg-amber-50` | `text-warning-text hover:bg-warning-light` |

### Critério de aceite

- [x] Cores visualmente equivalentes (amber → yellow/warning)
- [x] Botão Promessa na RotaPage mantém destaque visual
- [x] `tsc --noEmit` limpo

---

## F5 — ParcelaList: remover sombra

**Complexidade:** Baixa
**Arquivos:** 1

### O que fazer

Em `ParcelaList.tsx:87`:
```tsx
// Antes
className={`... shadow transition-shadow hover:shadow-md ${getCardEstilo(p)}`}

// Depois
className={`... transition hover:border-blue-300 ${getCardEstilo(p)}`}
```

### Critério de aceite

- [x] Cards de parcela sem sombra, apenas borda
- [x] Hover muda borda para azul (consistente com demais cards)
- [x] `tsc --noEmit` limpo

---

## F6 — Inputs: remover shadow-sm

**Complexidade:** Baixa
**Arquivos:** 4 (ClienteNovo, ClienteEdit, ContratoNovo, ContratoEdit)

### O que fazer

Remover `shadow-sm` de todas as classes de input nos formulários.

> CUIDADO: `ContratoEdit.tsx:210` e `ContratoNovo.tsx:279` têm `border-0 shadow-sm` — remover `shadow-sm` mas manter `border-0` (são inputs especiais de data).

### Critério de aceite

- [x] Inputs mantêm borda e padding, apenas sem sombra
- [x] Inputs de data (border-0) continuam funcionando
- [x] `tsc --noEmit` limpo

---

## F7 — Cabeçalhos inconsistentes

**Complexidade:** Muito baixa
**Arquivos:** 2

### O que fazer

| Arquivo | Local | Antes | Depois |
|---------|-------|-------|--------|
| `CobrancaList.tsx` | 122 | `text-lg font-semibold text-gray-400` | `text-lg font-semibold text-gray-500` |
| `RotaCobrancaSection.tsx` | 24 | `text-base font-semibold text-gray-800` | `text-lg font-semibold text-gray-800` |

### Critério de aceite

- [x] "Visitados" no Dashboard fica ligeiramente mais escuro (gray-400 → gray-500)
- [x] Título da RotaCobrancaSection fica maior (text-base → text-lg)
- [x] `tsc --noEmit` limpo

---

## F2 — Extrair CobrancaCard

**Complexidade:** Média
**Arquivos:** 1 novo + 2 alterados

### F2a — Criar CobrancaCard.tsx

Criar `modules/operacoes/components/CobrancaCard.tsx`

```tsx
interface CobrancaCardProps {
  clienteNome: string
  totalPendente: number
  quantidadeParcelas: number
  situacao: string
  visitadoEm?: string | null
  distancia?: number | null
  variant: "compact" | "detail"
  onNavigate?: () => void
  onWhatsApp?: () => void
  onLigar?: () => void
  onAbrir?: () => void
}
```

### F2b — CobrancaList.tsx

Substituir `CobrancaCard` local por:
```tsx
<CobrancaCard
  variant="compact"
  clienteNome={item.clienteNome}
  totalPendente={item.totalPendente}
  quantidadeParcelas={item.quantidadeParcelas}
  situacao={item.situacao}
  visitadoEm={item.visitadoEm}
  distancia={distancia}
  onNavigate={handleNavegar}
  onWhatsApp={handleWhatsApp}
  onLigar={handleLigar}
  onAbrir={handleAbrirContrato}
/>
```

### F2c — RotaPage.tsx

Substituir bloco de dados por:
```tsx
<CobrancaCard
  variant="detail"
  clienteNome={item.clienteNome}
  totalPendente={item.totalPendente}
  quantidadeParcelas={item.quantidadeParcelas}
  situacao={item.situacao}
  visitadoEm={item.visitadoEm}
  distancia={getDistancia(item)}
/>
```

### Critério de aceite

- [x] Visual: Dashboard mantém cards de cobrança idênticos
- [x] Visual: RotaPage mantém informações do cliente
- [x] Ações (WhatsApp, Ligar, Navegar, Abrir) continuam funcionando
- [x] `tsc --noEmit` limpo

---

## F3 — Padronizar botões da RotaPage

**Complexidade:** Média
**Arquivos:** 1

### O que fazer

1. **Botão Pagar** (linhas 472-479): migrar `<button>` inline para `Button` component
2. **Ações de visita** (linhas 482-512): migrar para `QuickActions layout="horizontal"` ou `Button` component
3. Remover imports de ícones específicos se não forem mais usados

### Critério de aceite

- [x] Botão Pagar visualmente idêntico (mesma cor verde, padding, sombra)
- [x] Ações de visita mantêm ícones e funcionalidade
- [x] `tsc --noEmit` limpo

---

## Resumo

| # | Entrega | Arquivos | Complexidade | Status |
|---|---------|----------|--------------|--------|
| F1 | Ícones no CobrancaList | 1 | 🔵 Muito baixa | ✅ |
| F4 | Amber → tokens | 2 | 🔵 Muito baixa | ✅ |
| F5 | ParcelaList sem sombra | 1 | 🔵 Baixa | ✅ |
| F6 | Inputs sem shadow-sm | 4 | 🔵 Baixa | ✅ |
| F7 | Cabeçalhos consistentes | 2 | 🔵 Muito baixa | ✅ |
| F2 | Criar CobrancaCard | 1 novo + 2 alt | 🟡 Média | ✅ |
| F3 | Botões RotaPage | 1 | 🟡 Média | ✅ |

---

## Referências

- `product/04-ROADMAP.md` §1.12
- `plans/PLAN-007-padronizacao-cobrancas.md`
- `shared/components/Card/Card.tsx`
- `shared/components/QuickActions/QuickActions.tsx`
- `design/02-DESIGN-SYSTEM.md`
