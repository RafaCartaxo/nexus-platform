# CHECKLIST — Fase 12 (Módulos Caixa e Gasto)

**Status:** Concluído

**Início:** 11/07/2026

**Conclusão:** 11/07/2026

**Roadmap:** product/04-ROADMAP.md §4

**Plano:** plans/PLAN-014-caixa-gasto.md

---

## Objetivo

Implementar os módulos de Caixa (BR-018 a BR-027) e Gasto (BR-028), com backend
completo (Clean Architecture), frontend (2 telas novas + integração Dashboard),
tabelas novas no banco e i18n em 3 locales.

---

## Ordem de execução (zero retrabalho)

```
F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8
```

F2 e F3 são independentes. F5 e F6 são independentes. F7 depende de F5 e F6.

---

## F1 — Database: tabelas novas

**Arquivos:** 1 alterado (`src/database.ts`)

### F1.1 — Tabela `gastos`

Criar tabela `gastos` no Drizzle schema + `CREATE TABLE IF NOT EXISTS`:

```sql
CREATE TABLE IF NOT EXISTS gastos (
  id TEXT PRIMARY KEY,
  valor REAL NOT NULL,
  categoria TEXT NOT NULL,
  observacao TEXT,
  data TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  deletedAt TEXT
)
```

### F1.2 — Tabela `fechamentos_semanais`

```sql
CREATE TABLE IF NOT EXISTS fechamentos_semanais (
  id TEXT PRIMARY KEY,
  dataInicio TEXT NOT NULL,
  dataFim TEXT NOT NULL,
  totalRecebido REAL NOT NULL,
  totalGasto REAL NOT NULL,
  resultado REAL NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
)
```

### F1.3 — Índices

```sql
CREATE INDEX IF NOT EXISTS idx_gastos_data ON gastos(data);
CREATE INDEX IF NOT EXISTS idx_fechamentos_semanais_data ON fechamentos_semanais(dataInicio);
```

### Critério de aceite

- [ ] Tabela `gastos` criada com colunas `id`, `valor`, `categoria`, `observacao`, `data`, `createdAt`, `deletedAt`
- [ ] Tabela `fechamentos_semanais` criada com colunas `id`, `dataInicio`, `dataFim`, `totalRecebido`, `totalGasto`, `resultado`, `createdAt`
- [ ] Ambos os índices criados
- [ ] Drizzle schema (objetos) sincronizados com as tabelas
- [ ] `node --loader tsx src/main.ts` sobe sem erros de tabela faltando

---

## F2 — Backend: Módulo Caixa

**Complexidade:** 🟡 Média
**Arquivos:** 11 novos + 1 alterado (`src/main.ts`)

### F2.1 — `caixa.entity.ts`

**Arquivo:** `src/modules/caixa/domain/caixa.entity.ts` (novo)

- [ ] Interface `CaixaConfig`: `id`, `caixaBase`, `updatedAt`
- [ ] Type alias `TipoMovimentacao`: `"entrada" | "saida"`
- [ ] Type alias `OrigemMovimentacao`: `"Contrato" | "Pagamento" | "Gasto" | "Cancelamento" | "Ajuste"`
- [ ] Interface `MovimentacaoFinanceira`: `id`, `tipo`, `valor`, `origem`, `origemId?`, `descricao?`, `data`, `createdAt`
- [ ] Interface `FechamentoSemanal`: `id`, `dataInicio`, `dataFim`, `totalRecebido`, `totalGasto`, `resultado`, `createdAt`

### F2.2 — `caixa.error.ts`

**Arquivo:** `src/modules/caixa/domain/errors/caixa.error.ts` (novo)

- [ ] `CaixaNotFoundError` (code: `CAIXA_NOT_FOUND`)
- [ ] `SemanaJaLiquidadaError` (code: `SEMANA_JA_LIQUIDADA`)

### F2.3 — `caixa.repository.ts` (port)

**Arquivo:** `src/modules/caixa/application/ports/caixa.repository.ts` (novo)

- [ ] Interface `ICaixaRepository` com métodos:
  - `getCaixaConfig(): Promise<CaixaConfig | null>`
  - `updateCaixaBase(valor: number): Promise<void>`
  - `saveMovimentacaoFinanceira(m: MovimentacaoFinanceira): Promise<void>`
  - `listMovimentacoes(params: ListMovimentacoesParams): Promise<ListMovimentacoesResult>`
  - `getRecebidoSemana(dataInicio: string, dataFim: string): Promise<number>`
  - `getGastoSemana(dataInicio: string, dataFim: string): Promise<number>`
  - `getSaldoAtual(): Promise<number>`
  - `saveFechamentoSemanal(f: FechamentoSemanal): Promise<void>`
  - `findFechamentoPorPeriodo(dataInicio: string, dataFim: string): Promise<FechamentoSemanal | null>`
- [ ] Interfaces `ListMovimentacoesParams`, `ListMovimentacoesResult`

### F2.4 — `caixa.repository.impl.ts`

**Arquivo:** `src/modules/caixa/infrastructure/repositories/caixa.repository.impl.ts` (novo)

- [ ] `getCaixaConfig()` — lê `caixa_config` (id = 'default')
- [ ] `updateCaixaBase(valor)` — atualiza `caixa_config.caixaBase`
- [ ] `saveMovimentacaoFinanceira(m)` — insere em `movimentacoesFinanceiras`
- [ ] `listMovimentacoes(params)` — query com filtros de data, origem, paginação
- [ ] `getRecebidoSemana(inicio, fim)` — soma `movimentacoesFinanceiras` origem "Pagamento" no período
- [ ] `getGastoSemana(inicio, fim)` — soma `movimentacoesFinanceiras` origem "Gasto" no período
- [ ] `getSaldoAtual()` — caixaBase + total entradas - total saídas
- [ ] `saveFechamentoSemanal(f)` — insere em `fechamentos_semanais`
- [ ] `findFechamentoPorPeriodo(inicio, fim)` — busca fechamento existente

### F2.5 — `AjustarCaixaBaseUseCase`

**Arquivos:**
- `src/modules/caixa/application/use-cases/AjustarCaixaBase/AjustarCaixaBaseInput.ts` (novo)
- `src/modules/caixa/application/use-cases/AjustarCaixaBase/AjustarCaixaBaseUseCase.ts` (novo)

- [ ] Schema zod: `{ valor: z.number().positive() }`
- [ ] Lógica: buscar caixa atual → calcular diferença → atualizar caixa → gerar movimentação (origem "Ajuste")
- [ ] Erro se `caixa_config` não encontrado (`CaixaNotFoundError`)

### F2.6 — `ListarMovimentacoesUseCase`

**Arquivos:**
- `src/modules/caixa/application/use-cases/ListarMovimentacoes/ListarMovimentacoesInput.ts` (novo)
- `src/modules/caixa/application/use-cases/ListarMovimentacoes/ListarMovimentacoesUseCase.ts` (novo)

- [ ] Schema zod: `{ dataInicio?, dataFim?, origem?, page?, limit? }`
- [ ] Delega para `repository.listMovimentacoes(params)`

### F2.7 — `LiquidarSemanaUseCase`

**Arquivos:**
- `src/modules/caixa/application/use-cases/LiquidarSemana/LiquidarSemanaUseCase.ts` (novo)

- [ ] Calcular período da semana atual (segunda a domingo)
- [ ] Verificar se já existe fechamento para o período (`SemanaJaLiquidadaError`)
- [ ] Somar recebido e gasto do período
- [ ] Criar `FechamentoSemanal`

### F2.8 — `caixa.controller.ts`

**Arquivo:** `src/modules/caixa/presentation/controllers/caixa.controller.ts` (novo)

- [ ] `getStatus(req, res)` — GET /api/caixa → retorna `CaixaStatus`
- [ ] `ajustar(req, res)` — POST /api/caixa/ajuste → valida com zod → chama use case
- [ ] `listMovimentacoes(req, res)` — GET /api/caixa/movimentacoes → query params → chama use case
- [ ] `liquidar(req, res)` — POST /api/caixa/liquidar → chama use case
- [ ] Tratamento de erros: 404, 409, 422, 500

### F2.9 — `caixa.routes.ts`

**Arquivo:** `src/modules/caixa/presentation/routes/caixa.routes.ts` (novo)

- [ ] Instanciar `CaixaRepository` + controller manualmente (padrão do projeto)
- [ ] `router.get("/", controller.getStatus.bind(controller))`
- [ ] `router.post("/ajuste", controller.ajustar.bind(controller))`
- [ ] `router.get("/movimentacoes", controller.listMovimentacoes.bind(controller))`
- [ ] `router.post("/liquidar", controller.liquidar.bind(controller))`
- [ ] Exportar `{ router as caixaRoutes }`

### F2.10 — Registrar em `main.ts`

**Arquivo:** `src/main.ts` (alterado)

- [ ] `import { caixaRoutes } from "./modules/caixa/presentation/routes/caixa.routes.js"`
- [ ] `app.use("/api/caixa", caixaRoutes)`

### F2.11 — TypeScript

- [ ] `npx tsc --noEmit` limpo (apenas módulo caixa)

---

## F3 — Backend: Módulo Gasto

**Complexidade:** 🟡 Média
**Arquivos:** 11 novos + 1 alterado (`src/main.ts`)

### F3.1 — `gasto.entity.ts`

**Arquivo:** `src/modules/gasto/domain/gasto.entity.ts` (novo)

- [ ] Interface `Gasto`: `id`, `valor`, `categoria`, `observacao?`, `data`, `createdAt`, `deletedAt?`

### F3.2 — `gasto.error.ts`

**Arquivo:** `src/modules/gasto/domain/errors/gasto.error.ts` (novo)

- [ ] `GastoNotFoundError` (code: `GASTO_NOT_FOUND`)

### F3.3 — `gasto.repository.ts` (port)

**Arquivo:** `src/modules/gasto/application/ports/gasto.repository.ts` (novo)

- [ ] Interface `IGastoRepository` com métodos:
  - `save(gasto: Gasto): Promise<void>`
  - `findAll(params: ListGastosParams): Promise<ListGastosResult>`
  - `findById(id: string): Promise<Gasto | null>`
  - `softDelete(id: string): Promise<void>`
- [ ] Interfaces `ListGastosParams`, `ListGastosResult`

### F3.4 — `gasto.repository.impl.ts`

**Arquivo:** `src/modules/gasto/infrastructure/repositories/gasto.repository.impl.ts` (novo)

- [ ] `save(gasto)` — insere em `gastos`
- [ ] `findAll(params)` — query com filtros de data, paginação; retorna `totalPeriodo` (soma dos valores)
- [ ] `findById(id)` — busca por id (excluindo soft-deleted)
- [ ] `softDelete(id)` — seta `deletedAt = datetime('now')`

### F3.5 — `CreateGastoUseCase`

**Arquivos:**
- `src/modules/gasto/application/use-cases/CreateGasto/CreateGastoInput.ts` (novo)
- `src/modules/gasto/application/use-cases/CreateGasto/CreateGastoUseCase.ts` (novo)

- [ ] Schema zod: `{ valor: z.number().positive(), categoria: z.string().min(1).max(50), data: z.string(), observacao?: z.string() }`
- [ ] Lógica (transação): salvar gasto → buscar caixa → debitar caixa → gerar movimentação financeira
- [ ] Construtor recebe `IGastoRepository` + `ICaixaRepository` (port do módulo caixa)

### F3.6 — `ListGastosUseCase`

**Arquivos:**
- `src/modules/gasto/application/use-cases/ListGastos/ListGastosInput.ts` (novo)
- `src/modules/gasto/application/use-cases/ListGastos/ListGastosUseCase.ts` (novo)

- [ ] Schema zod: `{ dataInicio?, dataFim?, page?, limit? }`
- [ ] Delega para `repository.findAll(params)`

### F3.7 — `DeleteGastoUseCase`

**Arquivos:**
- `src/modules/gasto/application/use-cases/DeleteGasto/DeleteGastoUseCase.ts` (novo)

- [ ] Buscar gasto por id → `GastoNotFoundError` se não encontrado
- [ ] Soft delete (não estorna caixa)

### F3.8 — `gasto.controller.ts`

**Arquivo:** `src/modules/gasto/presentation/controllers/gasto.controller.ts` (novo)

- [ ] `create(req, res)` — POST /api/gastos → valida com zod → chama use case
- [ ] `list(req, res)` — GET /api/gastos → query params → chama use case
- [ ] `remove(req, res)` — DELETE /api/gastos/:id → chama use case
- [ ] Tratamento de erros: 404, 422, 500

### F3.9 — `gasto.routes.ts`

**Arquivo:** `src/modules/gasto/presentation/routes/gasto.routes.ts` (novo)

- [ ] Instanciar `GastoRepository` + `CaixaRepository` + controller
- [ ] `router.post("/", controller.create.bind(controller))`
- [ ] `router.get("/", controller.list.bind(controller))`
- [ ] `router.delete("/:id", controller.remove.bind(controller))`
- [ ] Exportar `{ router as gastoRoutes }`

### F3.10 — Registrar em `main.ts`

**Arquivo:** `src/main.ts` (alterado)

- [ ] `import { gastoRoutes } from "./modules/gasto/presentation/routes/gasto.routes.js"`
- [ ] `app.use("/api/gastos", gastoRoutes)`

### F3.11 — TypeScript

- [ ] `npx tsc --noEmit` limpo (módulos caixa + gasto)

---

## F4 — Frontend: Serviços e Schemas

**Complexidade:** 🟢 Baixa
**Arquivos:** 3 novos

### F4.1 — `caixa.service.ts`

**Arquivo:** `frontend/src/modules/caixa/services/caixa.service.ts` (novo)

- [ ] Interface `CaixaStatus`: `caixaBase`, `saldoAtual`, `recebidoSemana`, `gastosSemana`, `resultadoSemana`
- [ ] Interface `MovimentacaoItem`: `id`, `tipo`, `valor`, `origem`, `origemId?`, `descricao?`, `data`, `createdAt`
- [ ] Interface `FechamentoSemanal`: `id`, `dataInicio`, `dataFim`, `totalRecebido`, `totalGasto`, `resultado`, `createdAt`
- [ ] `getCaixaStatus(): Promise<CaixaStatus>` → `GET /api/caixa`
- [ ] `ajustarCaixaBase(valor: number): Promise<{ caixaBase: number }>` → `POST /api/caixa/ajuste`
- [ ] `listarMovimentacoes(params?)` → `GET /api/caixa/movimentacoes`
- [ ] `liquidarSemana()` → `POST /api/caixa/liquidar`

### F4.2 — `gasto.service.ts`

**Arquivo:** `frontend/src/modules/gasto/services/gasto.service.ts` (novo)

- [ ] Interface `GastoItem`: `id`, `valor`, `categoria`, `observacao?`, `data`, `createdAt`
- [ ] Interface `CreateGastoInput`: `{ valor: number; categoria: string; data: string; observacao?: string }`
- [ ] `createGasto(data)` → `POST /api/gastos`
- [ ] `listGastos(params?)` → `GET /api/gastos`
- [ ] `deleteGasto(id)` → `DELETE /api/gastos/:id`

### F4.3 — `gasto.schema.ts`

**Arquivo:** `frontend/src/modules/gasto/schemas/gasto.schema.ts` (novo)

- [ ] Const `CATEGORIAS_GASTO`: `["Transporte", "Alimentação", "Material", "Manutenção", "Outros"] as const`
- [ ] Função `getGastoSchema(t: TFunction)` — retorna schema zod com mensagens i18n
- [ ] Campos: `valor` (string monetária, refine > 0), `categoria` (string min 1), `data` (string), `observacao` (opcional)
- [ ] Tipo `GastoFormData` inferido do schema

### F4.4 — TypeScript

- [ ] `npx tsc --noEmit` limpo (frontend)

---

## F5 — Frontend: Módulo Caixa

**Complexidade:** 🟢 Baixa
**Arquivos:** 2 novos

### F5.1 — `CaixaPage.tsx`

**Arquivo:** `frontend/src/modules/caixa/pages/CaixaPage.tsx` (novo)

- [ ] Fetch `getCaixaStatus()` ao montar
- [ ] Fetch `listarMovimentacoes()` ao montar
- [ ] Header: "← Caixa" com `ChevronLeft` + botão "Liquidar Semana →"
- [ ] Seção indicadores: 5 KPI cards (Caixa Base, Saldo Atual, Recebido Semana, Gastos Semana, Resultado Semana)
- [ ] Seção ajuste: input monetário + botão "Salvar Ajuste" via `feedback.run()`
- [ ] Seção movimentações: `MovimentacaoItem[]` com scroll vertical
- [ ] Estados: loading (skeleton), error (ErrorBanner + retry), vazio (mensagem)
- [ ] ConfirmModal ao liquidar semana
- [ ] Ao liquidar, recarregar status + movimentações

### F5.2 — TypeScript

- [ ] `npx tsc --noEmit` limpo

---

## F6 — Frontend: Módulo Gasto

**Complexidade:** 🟢 Baixa
**Arquivos:** 3 novos

### F6.1 — `GastoForm.tsx`

**Arquivo:** `frontend/src/modules/gasto/components/GastoForm.tsx` (novo)

- [ ] `useForm<GastoFormData>` com `zodResolver(getGastoSchema(t))`
- [ ] Campo `valor`: `<input>` com mask monetária (controlled via `watch` + `setValue`)
- [ ] Campo `categoria`: `<select>` com `CATEGORIAS_GASTO`
- [ ] Campo `data`: `<input type="date">`, default hoje
- [ ] Campo `observacao`: `<input type="text">` opcional
- [ ] Submit via `form.handleSubmit` → `feedback.run()` → `createGasto()`
- [ ] Callback `onSuccess` para a página limpar/reload

### F6.2 — `GastoList.tsx`

**Arquivo:** `frontend/src/modules/gasto/components/GastoList.tsx` (novo)

- [ ] Props: `items: GastoItem[]`, `totalPeriodo: number`, `onDelete: (id: string) => void`
- [ ] Exibe total do período no cabeçalho
- [ ] Lista com scroll: cada item mostra categoria, valor, observação, data, botão excluir (✕)
- [ ] Botão excluir abre `ConfirmModal`

### F6.3 — `GastoPage.tsx`

**Arquivo:** `frontend/src/modules/gasto/pages/GastoPage.tsx` (novo)

- [ ] Fetch `listGastos()` ao montar
- [ ] Header: "← Gastos"
- [ ] Seção formulário: `<GastoForm onSuccess={refetch} />`
- [ ] Seção lista: `<GastoList items={...} onDelete={handleDelete} />`
- [ ] Estados: loading (skeleton), erro (ErrorBanner + retry), vazio (mensagem)
- [ ] `handleDelete`: ConfirmModal → `deleteGasto(id)` → feedback → refetch

### F6.4 — TypeScript

- [ ] `npx tsc --noEmit` limpo

---

## F7 — Integração: Navbar, App.tsx, Dashboard, i18n

**Complexidade:** 🟢 Baixa
**Arquivos:** 7 alterados

### F7.1 — `App.tsx`

**Arquivo:** `frontend/src/App.tsx` (alterado)

- [ ] `import { CaixaPage } from "./modules/caixa/pages/CaixaPage.js"`
- [ ] `import { GastoPage } from "./modules/gasto/pages/GastoPage.js"`
- [ ] `<Route path="/caixa" element={<CaixaPage />} />`
- [ ] `<Route path="/gastos" element={<GastoPage />} />`

### F7.2 — `Navbar.tsx`

**Arquivo:** `frontend/src/shared/components/Navbar.tsx` (alterado)

- [ ] Adicionar no array `links`:
  - `{ to: "/caixa", label: t("nav.caixa") }`
  - `{ to: "/gastos", label: t("nav.gastos") }`

### F7.3 — `OperacoesDashboard.tsx`

**Arquivo:** `frontend/src/modules/operacoes/pages/OperacoesDashboard.tsx` (alterado)

- [ ] Import `getCaixaStatus` de `caixa.service`
- [ ] Import `listGastos` de `gasto.service`
- [ ] Estado `caixaStatus: CaixaStatus | null`
- [ ] Estado `gastosHoje: number`
- [ ] `fetchCaixa()` — chama `getCaixaStatus()`, falha silenciosamente
- [ ] `fetchGastos()` — chama `listGastos({ dataInicio: hoje, dataFim: hoje, limit: 1 })`, extrai `totalPeriodo`
- [ ] Chamar ambos no `useEffect` inicial + quando `eventBus` disparar `"operacao:atualizada"`
- [ ] Passar `caixaBase={caixaStatus?.caixaBase}` e `gastosHoje={gastosHoje}` para `IndicadoresCards`
- [ ] Passar `onCaixaClick` e `onGastosClick` navegando para `/caixa` e `/gastos`

### F7.4 — `IndicadoresCards.tsx`

**Arquivo:** `frontend/src/modules/operacoes/components/IndicadoresCards.tsx` (alterado)

- [ ] Novas props opcionais: `caixaBase?: number`, `gastosHoje?: number`
- [ ] Novas props de callback: `onCaixaClick?: () => void`, `onGastosClick?: () => void`
- [ ] Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`
- [ ] 2 novos `<KpiCard>` (após os 4 existentes):
  - `variant="gray"`, `title={t("caixa.caixaBase")}`, `onClick={onCaixaClick}`
  - `variant="gray"`, `title={t("gasto.totalHoje")}`, `onClick={onGastosClick}`

### F7.5 — i18n: `pt-BR.json`

**Arquivo:** `frontend/src/i18n/locales/pt-BR.json` (alterado)

- [ ] `nav.caixa`: "Caixa", `nav.gastos`: "Gastos"
- [ ] `caixa.*`: title, caixaBase, saldoAtual, recebidoSemana, gastosSemana, resultadoSemana, ajustar, ajustarValor, ajustarSalvar, ajustarSucesso, movimentacoes, nenhumaMovimentacao, liquidar, liquidarConfirmacao, liquidarSucesso, erroCarregar
- [ ] `gasto.*`: title, novo, valor, categoria, data, observacao, registrar, sucesso, totalHoje, totalPeriodo, erroCriar, erroExcluir, excluirConfirmacao, nenhumGasto
- [ ] `gasto.validacao.*`: valorObrigatorio, valorPositivo, categoriaObrigatoria

### F7.6 — i18n: `en.json`

**Arquivo:** `frontend/src/i18n/locales/en.json` (alterado)

- [ ] Todas as mesmas chaves com traduções em inglês

### F7.7 — i18n: `es.json`

**Arquivo:** `frontend/src/i18n/locales/es.json` (alterado)

- [ ] Todas as mesmas chaves com traduções em espanhol

### F7.8 — TypeScript

- [ ] `npx tsc --noEmit` limpo (frontend completo)

---

## F8 — Documentação

**Complexidade:** 🟢 Baixa
**Arquivos:** 1 novo + 4 alterados

### F8.1 — `04-ROADMAP.md`

**Arquivo:** `product/04-ROADMAP.md` (alterado)

- [ ] Atualizar Fase 4: status "Pendente" → "Concluído ✅"
- [ ] Adicionar referência ao PLAN-014

### F8.2 — `02-API.md`

**Arquivo:** `engineering/02-API.md` (alterado)

- [ ] Adicionar seção "Módulo Caixa" com 4 endpoints documentados
- [ ] Adicionar seção "Módulo Gasto" com 3 endpoints documentados

### F8.3 — `01-DATABASE.md`

**Arquivo:** `engineering/01-DATABASE.md` (alterado)

- [ ] Adicionar `gastos` e `fechamentos_semanais` na lista de entidades persistidas

### F8.4 — `PLAN-014-caixa-gasto.md`

**Arquivo:** `plans/PLAN-014-caixa-gasto.md` (alterado)

- [ ] Atualizar status: "Planejado" → "Concluído"
- [ ] Adicionar data de conclusão

### F8.5 — `plans/README.md`

**Arquivo:** `plans/README.md` (alterado)

- [ ] Adicionar linha: `PLAN-014-caixa-gasto.md | Módulos Caixa e Gasto | Concluído`

---

## Resumo de Arquivos

| Fase | Tipo | Novos | Alterados | Total |
|------|------|-------|-----------|-------|
| F1 | Database | 0 | 1 | 1 |
| F2 | Backend Caixa | 11 | 1 | 12 |
| F3 | Backend Gasto | 11 | 0 | 11 |
| F4 | Frontend Services | 3 | 0 | 3 |
| F5 | Frontend Caixa | 2 | 0 | 2 |
| F6 | Frontend Gasto | 3 | 0 | 3 |
| F7 | Integração | 0 | 7 | 7 |
| F8 | Documentação | 0 | 5 | 5 |
| **Total** | | **30** | **14** | **44** |

---

## Resumo de Entregas

| # | Entrega | Arquivos | Complexidade | Status |
|---|---------|----------|--------------|--------|
| F1 | Database | 1 alt | 🟢 Baixa | ⏳ |
| F2 | Backend Caixa | 11 novos + 1 alt | 🟡 Média | ⏳ |
| F3 | Backend Gasto | 11 novos | 🟡 Média | ⏳ |
| F4 | Services + Schemas | 3 novos | 🟢 Baixa | ⏳ |
| F5 | Frontend Caixa | 2 novos | 🟢 Baixa | ⏳ |
| F6 | Frontend Gasto | 3 novos | 🟢 Baixa | ⏳ |
| F7 | Integração | 7 alt | 🟢 Baixa | ⏳ |
| F8 | Documentação | 5 alt | 🟢 Baixa | ⏳ |
