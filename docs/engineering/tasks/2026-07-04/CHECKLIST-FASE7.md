# CHECKLIST — Fase 7 (Carrossel de Navegação)

**Status:** Concluído

**Início:** 04/07/2026

**Roadmap:** product/04-ROADMAP.md §1.13

**Plano:** plans/PLAN-008-carrossel-navegacao.md

---

## Objetivo

Substituir a navegação vertical/contador por um carrossel horizontal em duas telas,
melhorando a ergonomia mobile com gestos de swipe e scroll horizontal.

---

## Ordem de execução (zero retrabalho)

```
C1 → C2 → C3
```

Componente primeiro, consumidores depois.

---

## C1 — Criar Carousel component

**Complexidade:** Média
**Arquivos:** 1 novo

### O que fazer

Criar `shared/components/Carousel/Carousel.tsx`:

```tsx
import { useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselProps<T> {
  mode: "slide" | "scroll"
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  currentIndex?: number
  onIndexChange?: (index: number) => void
  itemWidth?: string
  className?: string
}
```

**Modo `slide`:**
- Container relativo com `overflow-hidden`
- Se `items.length === 0`, renderiza `null`
- Renderiza apenas o item `currentIndex` (não todos)
- Setas Chevrón nas laterais (ChevronLeft, ChevronRight) — `absolute inset-y-0`, z-10, opacidade, hover visível
- Dots indicadores centralizados abaixo (bolinhas)
- Swipe: `onTouchStart` salva `touch.startX`, `onTouchEnd` compara diff > 50px → `onIndexChange`
- Desabilitar setas nos extremos

**Modo `scroll`:**
- Container com `overflow-x-auto`, `snap-x snap-mandatory snap-start`, `gap-4`, `pb-2`
- Cada item com `snap-start shrink-0` + largura `itemWidth` (default `w-72`)
- Dots indicadores opcionais abaixo
- Scroll nativo do navegador (sem swipe custom)

### Critério de aceite

- [x] Modo slide: 1 item por vez, navegação por swipe + setas
- [x] Modo slide: dots indicam posição atual
- [x] Modo scroll: cards lado a lado com scroll horizontal nativo
- [x] `tsc --noEmit` limpo

---

## C2 — Migrar RotaPage para slide

**Complexidade:** Média
**Arquivos:** 1 alterado

### O que fazer

Em `RotaPage.tsx`:

1. Importar `Carousel` de `../../../shared/components/Carousel/Carousel.js`
2. Envolver o bloto de conteúdo do item atual em `<Carousel mode="slide">`:
   ```tsx
   <Carousel
     mode="slide"
     items={sortedItems}
     currentIndex={indiceAtual}
     onIndexChange={setIndiceAtual}
     renderItem={(item) => (
       <>
         <Card.Root variant="collection">
           {operando && <div className="h-1 animate-pulse bg-primary" />}
           <CobrancaCard variant="detail" ... />
           <div className="border-b border-gray-100 px-6 py-4">
             <QuickActions layout="vertical" ... />
           </div>
           <div className="px-6 py-4">
             <Button onClick={() => setPagamentoOpen(true)} ... />
           </div>
           <div className="border-t border-gray-100 px-6 py-4">
             <QuickActions layout="vertical" ... />
           </div>
         </Card.Root>
       </>
     )}
   />
   ```
3. Remover os botões Anterior/Próximo e contador manual (linhas 491-515)
4. Remover o parágrafo de visitados (linhas 517-521) — informação duplicada com dots do Carousel
5. Remover imports não utilizados (`ChevronLeft`, `ChevronRight`)
6. Manter `indiceAtual` e lógica de ajuste de índice intactas

### Critério de aceite

- [x] Navegação por swipe entre cobranças funciona
- [x] Setas nas laterais funcionam como fallback
- [x] Dots mostram posição correta
- [x] Botão Pagar e ações de visita continuam funcionando
- [x] `tsc --noEmit` limpo

---

## C3 — Migrar Dashboard para scroll

**Complexidade:** Média
**Arquivos:** 1 alterado

### O que fazer

Em `OperacoesDashboard.tsx`:

1. Importar `Carousel` de `../../../shared/components/Carousel/Carousel.js`
2. Substituir `<CobrancaList>` por:
   ```tsx
   {sortedCobrancas.length > 0 && (
     <div className="space-y-2">
       <h2 className="text-xl font-semibold text-gray-800">{t("operacoes.cobrancasDoDia")}</h2>
       <Carousel
         mode="scroll"
         items={sortedCobrancas}
         renderItem={(item) => (
           <CobrancaCard
             variant="compact"
             clienteNome={item.clienteNome}
             totalPendente={item.totalPendente}
             quantidadeParcelas={item.quantidadeParcelas}
             situacao={item.situacao}
             visitadoEm={item.visitadoEm}
             distancia={calcularDistancia(item)}
             onNavigate={() => handleNavegar(item)}
             onWhatsApp={() => handleWhatsApp(item)}
             onLigar={() => handleLigar(item)}
             onAbrir={() => handleAbrirContrato(item)}
           />
         )}
       />
     </div>
   )}
   ```
3. Extrair funções de ação (handleWhatsApp, handleLigar, etc.) para dentro do componente ou usar callbacks inline
4. Importar `CobrancaCard` se ainda não estiver importado
5. Remover import de `CobrancaList` se não for mais usado

### Critério de aceite

- [x] Cards aparecem em scroll horizontal com largura fixa (w-72)
- [x] Ações (WhatsApp, Ligar, Navegar, Abrir) funcionam
- [x] Dashboard mantém IndicadoresCards e RotaCobrancaSection no lugar
- [x] `tsc --noEmit` limpo

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
- `plans/PLAN-008-carrossel-navegacao.md` — Plano detalhado
- `shared/components/Card/Card.tsx`
- `shared/components/QuickActions/QuickActions.tsx`
- `modules/operacoes/components/CobrancaCard.tsx`
- `modules/operacoes/pages/RotaPage.tsx`
- `modules/operacoes/pages/OperacoesDashboard.tsx`
