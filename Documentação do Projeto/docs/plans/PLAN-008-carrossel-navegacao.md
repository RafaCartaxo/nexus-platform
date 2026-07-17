# PLAN-008 — Carrossel de Navegação Horizontal

## Objetivo

✅ **Concluído em 04/07/2026**

Substituir a navegação vertical/contador por um carrossel horizontal em duas telas,
melhorando a ergonomia mobile com gestos de swipe e scroll horizontal.

---

## Diagnóstico

| Tela | Hoje | Problema |
|------|------|----------|
| **RotaPage** | Contador + botões Anterior/Próximo abaixo do card | Requer toque preciso em botão pequeno; sem gesto de swipe |
| **Dashboard** | Lista vertical (`CobrancaList`) com `space-y-4` | Cards ocupam largura total; sem visão panorâmica dos clientes |
| Demais telas | Vertical | Não aplicável (detalhe/lista não são navegação sequencial) |

---

## Arquitetura

### Carousel (componente compartilhado)

```
shared/components/Carousel/Carousel.tsx
```

```
RotaPage / Dashboard
↓
Carousel (componente compartilhado)
├── mode="slide"  → 1 item, swipe + setas + contador
└── mode="scroll" → vários itens, scroll horizontal com snap
↓
renderItem: (item, index) => ReactNode
```

### API proposta

```tsx
interface CarouselProps<T> {
  mode: "slide" | "scroll"
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  currentIndex?: number
  onIndexChange?: (index: number) => void
  itemWidth?: string  // ex: "w-72" — só para mode="scroll"
  className?: string
}
```

### Modo slide (RotaPage)

```
┌─────────────────────────────────┐
│  ← [card full width]  →        │
│     setas nas laterais          │
│                                 │
│  • 1 de 5 •                     │ ← dots indicadores
└─────────────────────────────────┘
```

- Swipe esquerda → próxima cobrança
- Swipe direita → cobrança anterior
- Setas Chevrón nos cantos como fallback
- Contador "1 de 5" no canto superior
- `currentIndex` + `onIndexChange` controlam externamente (RotaPage mantém estado)

### Modo scroll (Dashboard)

```
┌─────────────────────────────────┐
│ [card][card][card][card]... →   │ ← overflow-x-auto + snap-x
│  w-72 cada, gap-4               │
│ ● ● ○ ○ ○ (dots)               │ ← indicador de posição
└─────────────────────────────────┘
```

- Scroll horizontal nativo com `snap-x snap-mandatory snap-start`
- Cada card com largura fixa (`itemWidth`, default `w-72`)
- Indicador de dots na parte inferior
- Scroll substitui a vertical `CobrancaList`

---

## Telas afetadas

| Tela | Modo | O que muda |
|------|------|------------|
| **RotaPage** | slide | Remove botões Anterior/Próximo; adiciona swipe + setas nas laterais do card; mantém contador + dots |
| **Dashboard** | scroll | Substitui `CobrancaList` vertical por carrossel horizontal com cards compact; mantém seções "Cobranças do Dia" e "Visitados" como headers acima |

**Não afetadas:** ContratoDetail, ClienteDetail, ClienteList, ContratoList (permanecem verticais)

---

## Entregas

### C1 — Criar Carousel component

**Arquivo novo:** `shared/components/Carousel/Carousel.tsx`

**Comportamento:**
- `mode="slide"`: exibe 1 item por vez, setas Chevrón nas laterais, swipe touch, dots indicadores
- `mode="scroll"`: container com `overflow-x-auto`, `snap-x snap-mandatory snap-start`, `gap-4`, largura fixa por item (`itemWidth`)
- Swipe detectado via `onTouchStart`/`onTouchEnd` (diferença > 50px)

**Arquivos:** 1 novo

### C2 — Migrar RotaPage para slide

**Arquivo alterado:** `RotaPage.tsx`

**Mudanças:**
- Envolver o bloco `Card.Root` + CobrancaCard + ações + pagamento + promessa dentro de `<Carousel mode="slide">`
- Passar `currentIndex={indiceAtual}` e `onIndexChange={setIndiceAtual}`
- Remover botões Anterior/Próximo e contador manual do final
- Remover imports: `ChevronLeft` (se não usado em outro lugar), `ChevronRight`

**Arquivos:** 1 alterado

### C3 — Migrar Dashboard para scroll

**Arquivo alterado:** `OperacoesDashboard.tsx`

**Mudanças:**
- Substituir `<CobrancaList>` por `<Carousel mode="scroll">`
- Renderizar `<CobrancaCard variant="compact">` dentro de cada slide
- Manter headers "Cobranças do Dia" e "Visitados" como `SectionHeader` acima do carrossel
- Manter `RotaCobrancaSection` e `IndicadoresCards` inalterados

**Arquivos:** 1 alterado

---

## Ordem de execução (zero retrabalho)

```
C1 → C2 → C3
```

1. **C1** — Componente independente, sem dependências
2. **C2** — RotaPage usa o Carousel recém-criado, remove navegação antiga
3. **C3** — Dashboard usa o Carousel, substitui lista vertical

---

## Resumo

| # | Entrega | Arquivos | Complexidade | Status |
|---|---------|----------|--------------|--------|
| C1 | Criar Carousel component | 1 novo | 🟡 Média | ✅ |
| C2 | Migrar RotaPage para slide | 1 alt | 🟡 Média | ✅ |
| C3 | Migrar Dashboard para scroll | 1 alt | 🟡 Média | ✅ |

---

## Referências

- `product/04-ROADMAP.md` §1.13
- `shared/components/Card/Card.tsx` — Card usado dentro dos slides
- `modules/operacoes/components/CobrancaCard.tsx` — Card renderizado no carrossel
- `modules/operacoes/pages/RotaPage.tsx` — Slide: controle de índice + CobrancaCard detail + ações
- `modules/operacoes/pages/OperacoesDashboard.tsx` — Scroll: CobrancaCard compact
- `engineering/tasks/2026-07-04/CHECKLIST-FASE7.md` — Checklist executável
