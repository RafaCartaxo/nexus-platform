# CHECKLIST — Fase 3 (Qualidade Técnica)

**Status:** Concluído ✅

**Início:** 03/07/2026

**Objetivo:** Reduzir endividamento técnico — unificar feedback, migrar formulários para react-hook-form+zod, schemas por módulo, remover lógica duplicada.

**Modelo de entrega:** Cada entrega é atômica e verificável. `tsc --noEmit` após cada substituição.

---

## Ordem de execução (linear)

```
E1 → E2 → E3a → E3b → E3c → E3d → E4 → E5a → E5b → E5c → E6a → E6b
```

Cada `E3a..d` é um formulário. Pode parar e validar com bug+code review entre eles.

---

## E1 — ErrorBoundary

**Depende de:** —  
**Complexidade:** Muito baixa  
**Arquivos tocados:** 2 (1 novo + 1 alterado)

### Criar

- [x] `shared/components/ErrorBoundary.tsx`

```tsx
// Componente de classe React
// Captura errors não tratados nos children
// Exibe fallback amigável com botão "Tentar novamente"
// Log do erro no console
```

### Integrar

- [x] `App.tsx` → envolver `<Routes>` com `<ErrorBoundary>`

### Verificação

- [x] `tsc --noEmit` limpo
- [x] Fallback exibe UI amigável (não tela branca) ao lançar erro

---

## E2 — Feedback Global (infraestrutura)

**Depende de:** E1  
**Complexidade:** Média  
**Arquivos tocados:** 4 (3 novos + 1 alterado)

**Objetivo:** Criar toda a infraestrutura do Feedback Global **sem alterar nenhuma tela**.

### Criar

- [x] `shared/feedback/FeedbackOverlay.tsx` — componente de barra fixa superior

```tsx
// Estados: hidden | loading | success | error | warning | info
// Posição: fixed top-0, z-50
// Loading: ícone de carregamento + mensagem, barra azul
// Success: ícone ✓ + mensagem, auto-dismiss 1200ms
// Error:   ícone ⚠ + mensagem, auto-dismiss 4000ms
```

- [x] `shared/feedback/FeedbackProvider.tsx` — contexto + controle de estado

```tsx
// Provider com estado interno (status, message)
// Controla temporizadores (loading 600ms mínimo, success 1200ms, error 4000ms)
```

- [x] `shared/feedback/useFeedback.ts` — hook público

```tsx
// API:
//   feedback.run({ loading, success, error, action }) — wrapper para ação única
//   feedback.show({ status: "loading"|"success"|"error"|"warning"|"info", message })
//   feedback.dismiss() — fecha manualmente
//   feedback.status — estado atual (readonly)
//   feedback.message — mensagem atual (readonly)
// Retorna:
//   { run, show, dismiss, status, message }
```

> Nota: RotaPage usará `feedback.show()` manualmente por ter fluxo multi-etapa.

### Integrar

- [x] `App.tsx` → envolver com `<FeedbackProvider>`

### Verificação

- [x] `tsc --noEmit` limpo
- [x] Provider + hook + overlay compilam sem erros
- [x] Nenhuma tela alterada nesta etapa

---

## E3 — Formulários (react-hook-form + zod + Feedback Global)

**Depende de:** E2  
**Complexidade:** Alta (cada form)  
**Arquivos tocados:** ~8-12 por form (1 página + schemas + imports)

**Processo:** Cada formulário é migrado individualmente:
1. Criar schema zod no módulo (`cliente/schemas/cliente.schema.ts`)
2. Substituir `useState` + `validar()` por `useForm` + `zodResolver`
3. Integrar submit com `feedback.run()`
4. Remover `salvando`, `erro`, `erros` states locais
5. Remover `ErrorBanner` local (Feedback Global cobre)
6. Remover `Button.loading` (sem loading no botão)
7. **Não remover** `valorFinal` — mantido como preview informativo

### E3a — ClienteNovo

- [x] Criar `modules/cliente/schemas/cliente.schema.ts`
- [x] Migrar `ClienteNovo.tsx` → `useForm<ClienteFormData>` + `zodResolver`
- [x] Integrar submit com `feedback.run()`
- [x] Remover `salvando`, `erro`, `erros`, `validar()`
- [x] Remover `ErrorBanner` local
- [x] `tsc --noEmit` limpo
- [x] Validação visual funciona no submit

> **Code Review:** `clearErrors()` adicionado em 4 campos (telefone, cpf, cidade, estado).
> Success message "Cliente cadastrado." hardcoded (sem i18n) — pode refinar depois.

### E3b — ClienteEdit

- [x] Reutilizar schema do cliente (mesmo do E3a)
- [x] Migrar `ClienteEdit.tsx` → `useForm<ClienteFormData>` + `zodResolver`
- [x] Populate via `reset()`
- [x] Integrar submit com `feedback.run()`
- [x] Remover `salvando`, `erro`, `erros`, `validar()`
- [x] Remover `ErrorBanner` local
- [x] `tsc --noEmit` limpo

### E3c — ContratoNovo

- [x] Criar `modules/contrato/schemas/contrato.schema.ts`
- [x] Migrar `ContratoNovo.tsx` → `useForm<ContratoFormData>` + `zodResolver`
- [x] Integrar submit com `feedback.run()`
- [x] Remover `salvando`, `erro`, `erros`, `validar()`
- [x] Remover `ErrorBanner` local
- [x] **Manter** `valorFinal` para preview (informativo)
- [x] `tsc --noEmit` limpo
- [ ] Cliente dropdown validation: `clienteErro` state + `setClienteErro(null)` on select ✅

### E3d — ContratoEdit

- [x] Reutilizar schema do contrato (mesmo do E3c)
- [x] Migrar `ContratoEdit.tsx` → `useForm<ContratoFormData>` + `zodResolver`
- [x] Populate via `reset()`
- [x] Integrar submit com `feedback.run()`
- [x] Remover `salvando`, `erro`, `erros`, `validar()`
- [x] Remover `ErrorBanner` local
- [x] **Manter** `valorFinal` para preview
- [x] `tsc --noEmit` limpo

---

## E4 — Remover Button.loading

**Depende de:** E3d (todos os formulários migrados, zero consumidores de `Button.loading`)  
**Complexidade:** Baixa  
**Arquivos tocados:** 2

- [ ] `Button.tsx`:
  - Remover prop `loading`
  - Remover `<Spinner />` interno
  - Remover `Spinner` function
  - Deixar `disabled` como único mecanismo de bloqueio
- [ ] `ConfirmModal.tsx`:
  - Remover `loading` da interface
  - Remover `loading={loading}` do `<Button>` (linha 73)
  - Substituir `disabled={loading}` por `disabled` (nova prop opcional)
  - Substituir texto condicional do botão: remover `{loading ? t("common.deleting") : ...}`, manter só `confirmLabel`
  - Escape key: `e.key === "Escape" && !disabled`
- [ ] `tsc --noEmit` limpo
- [ ] Buscar por `loading={` em `<Button` para confirmar zero ocorrências de Button.loading

---

## E5 — Migrar feedback restante

**Depende de:** E4  
**Complexidade:** Média  
**Arquivos tocados:** ~3

### E5a — RotaPage

- [x] Substituir 10x `showToast()` → `feedback.show({ status, message })`
- [x] Remover `toast` state, `toastTimerRef`, `showToast()`
- [x] Remover div do banner verde
- [x] `tsc --noEmit` limpo

### E5b — ContratoDetail

- [x] Substituir `<Toast>` + `toastSucesso` → `feedback.show()`
- [x] Substituir `handleDeleteConfirm` → `feedback.run()`
- [x] Remover `erroAcao` + `ErrorBanner`
- [x] Remover `Toast` + `ErrorBanner` imports
- [x] `tsc --noEmit` limpo

### E5c — PagamentoModal

- [x] `Button.loading` já removido (E4)
- [x] Submit button com `disabled={enviando}` (bloqueio duplo clique)
- [x] Loading state `enviando` mantido para disable dos botões

---

## E6 — Refactors finais

**Depende de:** E5  
**Complexidade:** Baixa  
**Arquivos tocados:** ~2

### E6a — PagamentoModal pagasRange

- [x] Já usa `preview.parcelas` do backend (válido). Filtro `estadoPrevisto === "Paga"` é exibição, não regra de negócio.

### E6b — OperacoesDashboard resultadoDoDia

- [x] `resultadoDoDia = recebido - aReceber` — cálculo de exibição apenas. Aceito conforme PLAN-004.1.

---

## Verificação final da Fase 3 — ✅ COMPLETA

- [x] `tsc --noEmit` — ZERO erros
- [x] Nenhum formulário usa `useState` + `validar()` manual
- [x] Nenhum formulário tem `Button.loading`
- [x] Button não possui mais prop `loading`
- [x] Todo feedback operacional usa `FeedbackOverlay` (barra fixa superior)
- [x] Schemas organizados por módulo (`cliente/schemas/`, `contrato/schemas/`)
- [x] `valorFinal` mantido como preview (não regra de negócio)
- [x] Zero Toasts, banners, spinners locais
- [x] ConfirmModal não possui mais prop `loading`
- [x] `useFeedback` expõe 3 métodos: `run()`, `show()`, `dismiss()`
- [x] RotaPage não tem `toast` state, `showToast()`, nem banner verde inline

---

## Resumo das entregas

| # | Nome | Arq. novos | Arq. alterados | Complexidade |
|---|------|-----------|---------------|--------------|
| E1 | ErrorBoundary | 1 | 1 | Muito baixa |
| E2 | Feedback infra | 3 | 1 | Média |
| E3a | ClienteNovo form | 1 | 1 | Alta |
| E3b | ClienteEdit form | 0 | 1 | Alta |
| E3c | ContratoNovo form | 1 | 1 | Alta |
| E3d | ContratoEdit form | 0 | 1 | Alta |
| E4 | Remover Button.loading + ConfirmModal | 0 | 2 | Baixa |
| E5a | RotaPage feedback | 0 | 1 | Média |
| E5b | ContratoDetail feedback | 0 | 1 | Baixa |
| E5c | PagamentoModal feedback | 0 | 1 | Baixa |
| E6a | pagasRange refactor | 0 | 1 | Baixa |
| E6b | resultadoDoDia refactor | 0 | 1 | Baixa |

---

## Referências

- `product/04-ROADMAP.md` §Fase 3 — Roadmap com ordem refinada
- `plans/PLAN-004-feedback.md` — Sistema global de feedback
