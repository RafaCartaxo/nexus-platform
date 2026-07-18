# PLAN-013 — Dark Mode

**Status:** Concluído

**Roadmap:** product/04-ROADMAP.md §5.1

**Início:** 11/07/2026

---

## Objetivo

Implementar tema escuro (dark mode) em todo o sistema, usando CSS custom
properties e Tailwind `class` strategy, com toggle no Navbar.

---

## Estratégia

- **Tailwind:** `darkMode: "class"` — toggle via classe `dark` no `<html>`
- **Cores:** CSS custom properties no `index.css` (`:root` + `.dark {}`)
- **Persistência:** `localStorage("theme")` + detecção `prefers-color-scheme`
- **Toggle:** botão Sun/Moon no Navbar

---

## Tokens Estruturais (novos)

| Token | Light | Dark |
|---|---|---|
| `--color-surface` | `#FFFFFF` | `#111827` |
| `--color-surface-secondary` | `#F9FAFB` | `#1F2937` |
| `--color-surface-hover` | `#F3F4F6` | `#374151` |
| `--color-text-primary` | `#1F2937` | `#F9FAFB` |
| `--color-text-secondary` | `#6B7280` | `#9CA3AF` |
| `--color-text-muted` | `#9CA3AF` | `#6B7280` |
| `--color-border` | `#D1D5DB` | `#4B5563` |
| `--color-border-light` | `#E5E7EB` | `#374151` |

## Mapeamento de Substituição

| Classe original | Nova classe |
|---|---|
| `bg-white` | `bg-surface` |
| `bg-gray-50` | `bg-surface-secondary` |
| `bg-gray-100` | `bg-surface-secondary` |
| `hover:bg-gray-100` / `hover:bg-gray-50` | `hover:bg-surface-hover` |
| `text-gray-900` / `text-gray-800` / `text-gray-700` | `text-text-primary` |
| `text-gray-600` / `text-gray-500` | `text-text-secondary` |
| `text-gray-400` | `text-text-muted` |
| `border-gray-300` | `border-border` |
| `border-gray-200` | `border-border-light` |
| `bg-gray-200` | `bg-surface-hover` |

---

## Entregas

| # | Descrição | Arquivos |
|---|---|---|
| 1 | Infraestrutura (config, CSS, ThemeProvider) | `tailwind.config.js`, `index.css`, `index.html`, `main.tsx` + 2 novos |
| 2 | Toggle no Navbar | `shared/components/Navbar.tsx` |
| 3 | Migrar shared components (13) | `Card`, `Button`, `Carousel`, `SearchBar`, `KpiCard`, `StatusBadge`, `QuickActions`, `ErrorBoundary`, `EstadoTela`, `SectionHeader`, `ErrorBanner`, `ConfirmModal`, `SuccessState` |
| 4 | Migrar páginas/componentes de módulo (21) | Todos os `*.tsx` em `modules/` |
| 5 | Documentação (6 docs + este plano) | `TOKEN.md`, `ROADMAP.md`, `UI-COMPONENTS.md`, `FRONTEND.md`, `MAPEAMENTO-TELAS.md`, `plans/README.md` |

---

## Impacto sobre outras demandas

| Demanda | Conflito? |
|---|---|
| Fase 4 (Caixa/Gasto) | Nenhum — novos componentes já nascem com tokens estruturais |
| Fase 8 (Conceito de Atendimento) | Nenhum — toca backend + types, não cores |

---

## Referências

- `product/04-ROADMAP.md` §5.1
- `engineering/design/05-TOKEN.md`
- `shared/theme/ThemeProvider.tsx`
- `shared/theme/useTheme.ts`
- `frontend/tailwind.config.js`
- `frontend/src/index.css`
