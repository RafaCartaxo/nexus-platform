# PLAN-014 — Módulos Caixa e Gasto

**Status:** Concluído

**Versão:** 1.0

**Início:** 11/07/2026

**Conclusão:** 11/07/2026

**Roadmap:** product/04-ROADMAP.md §4

---

## Objetivo

Implementar os módulos de Caixa (BR-018 a BR-027) e Gasto (BR-028), completando as regras de negócio documentadas e integrando indicadores financeiros ao Dashboard.

---

## Diagnóstico

### O que já existe

| Recurso | Local | Impacto |
|---------|-------|---------|
| Tabela `caixa_config` | `database.ts` | Já usada pelo módulo `contrato` para BR-019/BR-020 |
| Tabela `movimentacoesFinanceiras` | `database.ts` | Já populada por contratos e pagamentos |
| `getCaixaConfig()` | `contrato.repository.impl.ts` | Reaproveitar no novo módulo `caixa` |
| `updateCaixaBase()` | `contrato.repository.impl.ts` | Reaproveitar no novo módulo `caixa` |
| `saveMovimentacaoFinanceira()` | `contrato.repository.impl.ts` | Reaproveitar no novo módulo `caixa` |
| BR-019 (débito contrato) | `CreateContratoUseCase` | Já funcional |
| BR-020 (crédito pagamento) | `CreatePagamentoUseCase` | Já funcional |

### O que precisa ser construído

| Recurso | Tipo | BRs cobertas |
|---------|------|--------------|
| Módulo Caixa (backend) | Novo — 11 arquivos | BR-018, BR-022 a BR-027 |
| Módulo Gasto (backend) | Novo — 11 arquivos | BR-028 |
| Tabela `gastos` | Nova no `database.ts` | BR-028 |
| Tabela `fechamentos_semanais` | Nova no `database.ts` | BR-027 |
| Módulo Caixa (frontend) | Novo — 4 arquivos | — |
| Módulo Gasto (frontend) | Novo — 5 arquivos | — |
| Integração Dashboard | 2 arquivos alterados | — |
| Navbar + App.tsx | 2 arquivos alterados | — |
| i18n (3 locales) | 3 arquivos alterados | — |
| Documentação | 3 docs atualizados + 2 novos | — |

---

## Banco de Dados

### Arquivo: `src/database.ts`

Alterar a função `createTables()` para adicionar:

#### Nova tabela: `gastos`

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

#### Nova tabela: `fechamentos_semanais`

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

#### Novos índices

```sql
CREATE INDEX IF NOT EXISTS idx_gastos_data ON gastos(data);
CREATE INDEX IF NOT EXISTS idx_fechamentos_semanais_data ON fechamentos_semanais(dataInicio);
```

Adicionar também ao Drizzle schema (objetos `gastos` e `fechamentosSemanais`) para manter a consistência com o padrão existente.

---

## Backend — Módulo Caixa

### Estrutura de arquivos

```
src/modules/caixa/
  domain/
    caixa.entity.ts
    errors/
      caixa.error.ts
  application/
    ports/
      caixa.repository.ts
    use-cases/
      AjustarCaixaBase/
        AjustarCaixaBaseUseCase.ts
        AjustarCaixaBaseInput.ts
      ListarMovimentacoes/
        ListarMovimentacoesUseCase.ts
        ListarMovimentacoesInput.ts
      LiquidarSemana/
        LiquidarSemanaUseCase.ts
  infrastructure/
    repositories/
      caixa.repository.impl.ts
  presentation/
    controllers/
      caixa.controller.ts
    routes/
      caixa.routes.ts
```

### Entidade: `caixa.entity.ts`

```ts
export interface CaixaConfig {
  id: string
  caixaBase: number
  updatedAt: string
}

export type TipoMovimentacao = "entrada" | "saida"
export type OrigemMovimentacao = "Contrato" | "Pagamento" | "Gasto" | "Cancelamento" | "Ajuste"

export interface MovimentacaoFinanceira {
  id: string
  tipo: TipoMovimentacao
  valor: number
  origem: OrigemMovimentacao
  origemId?: string
  descricao?: string
  data: string
  createdAt: string
}

export interface FechamentoSemanal {
  id: string
  dataInicio: string
  dataFim: string
  totalRecebido: number
  totalGasto: number
  resultado: number
  createdAt: string
}
```

### Port: `caixa.repository.ts` (`ICaixaRepository`)

```ts
export interface ICaixaRepository {
  getCaixaConfig(): Promise<CaixaConfig | null>
  updateCaixaBase(valor: number): Promise<void>
  saveMovimentacaoFinanceira(m: MovimentacaoFinanceira): Promise<void>
  listMovimentacoes(params: ListMovimentacoesParams): Promise<ListMovimentacoesResult>
  getRecebidoSemana(dataInicio: string, dataFim: string): Promise<number>
  getGastoSemana(dataInicio: string, dataFim: string): Promise<number>
  saveFechamentoSemanal(f: FechamentoSemanal): Promise<void>
}
```

### Implementação: `caixa.repository.impl.ts`

Acessa as mesmas tabelas que o `contrato.repository.impl.ts` (`caixa_config`, `movimentacoesFinanceiras`) sem refatorar o módulo existente. Usa Drizzle para queries simples e raw SQL para agregações (seguindo o padrão do `operacoes.repository.impl.ts`).

### Endpoints

| Método | Rota | Use Case | Descrição |
|--------|------|----------|-----------|
| `GET` | `/api/caixa` | — | Status atual: caixaBase + saldo + indicadores semanais |
| `POST` | `/api/caixa/ajuste` | AjustarCaixaBase | Ajustar caixa base (BR-018) |
| `GET` | `/api/caixa/movimentacoes` | ListarMovimentacoes | Listar movimentações com filtros |
| `POST` | `/api/caixa/liquidar` | LiquidarSemana | Liquidação semanal (BR-027) |

#### `GET /api/caixa`

**Response 200:**
```json
{
  "caixaBase": 1500.00,
  "saldoAtual": 1320.00,
  "recebidoSemana": 480.00,
  "gastosSemana": 180.00,
  "resultadoSemana": 300.00
}
```

- `saldoAtual` = caixaBase - total de saídas (Contrato + Gasto) + total de entradas (Pagamento)
- `recebidoSemana` = soma de `movimentacoesFinanceiras` com origem "Pagamento" nos últimos 7 dias
- `gastosSemana` = soma de `movimentacoesFinanceiras` com origem "Gasto" nos últimos 7 dias
- `resultadoSemana` = recebidoSemana - gastosSemana

#### `POST /api/caixa/ajuste`

**Request:**
```json
{ "valor": 2000.00 }
```

**Validações (zod):**
| Campo | Obrigatório | Regra |
|-------|------------|-------|
| valor | Sim | number, > 0 |

**Lógica (transação):**
1. Buscar `caixa_config` atual
2. Calcular diferença = novoValor - caixaBase atual
3. Atualizar `caixa_config.caixaBase` para o novo valor
4. Gerar `MovimentacaoFinanceira` (`tipo`: "entrada" se diferença > 0, "saída" se < 0, `origem`: "Ajuste", `descricao`: "Ajuste manual do Caixa Base")

**Response 201:**
```json
{ "caixaBase": 2000.00 }
```

#### `GET /api/caixa/movimentacoes`

**Query params:**
| Parâmetro | Tipo | Obrigatório | Padrão |
|-----------|------|-------------|--------|
| dataInicio | string | Não | 7 dias atrás |
| dataFim | string | Não | hoje |
| origem | string | Não | — (todas) |
| page | number | Não | 1 |
| limit | number | Não | 20 |

**Response 200:**
```json
{
  "data": [
    {
      "id": "...",
      "tipo": "entrada",
      "valor": 60.00,
      "origem": "Pagamento",
      "origemId": "...",
      "descricao": null,
      "data": "2026-07-11",
      "createdAt": "2026-07-11T10:30:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### `POST /api/caixa/liquidar`

Sem body.

**Lógica (transação):**
1. Calcular data de início e fim da semana atual (segunda a domingo)
2. Somar `movimentacoesFinanceiras` com origem "Pagamento" no período → `totalRecebido`
3. Somar `movimentacoesFinanceiras` com origem "Gasto" no período → `totalGasto`
4. Criar `FechamentoSemanal` na tabela `fechamentos_semanais`
5. Retornar o registro criado

**Response 201:**
```json
{
  "id": "...",
  "dataInicio": "2026-07-06",
  "dataFim": "2026-07-12",
  "totalRecebido": 480.00,
  "totalGasto": 180.00,
  "resultado": 300.00,
  "createdAt": "2026-07-11T..."
}
```

### Registro em `main.ts`

```ts
import { caixaRoutes } from "./modules/caixa/presentation/routes/caixa.routes.js"
app.use("/api/caixa", caixaRoutes)
```

---

## Backend — Módulo Gasto

### Estrutura de arquivos

```
src/modules/gasto/
  domain/
    gasto.entity.ts
    errors/
      gasto.error.ts
  application/
    ports/
      gasto.repository.ts
    use-cases/
      CreateGasto/
        CreateGastoUseCase.ts
        CreateGastoInput.ts
      ListGastos/
        ListGastosUseCase.ts
        ListGastosInput.ts
      DeleteGasto/
        DeleteGastoUseCase.ts
  infrastructure/
    repositories/
      gasto.repository.impl.ts
  presentation/
    controllers/
      gasto.controller.ts
    routes/
      gasto.routes.ts
```

### Entidade: `gasto.entity.ts`

```ts
export interface Gasto {
  id: string
  valor: number
  categoria: string
  observacao?: string | null
  data: string
  createdAt: string
  deletedAt?: string | null
}
```

### Endpoints

| Método | Rota | Use Case | Descrição |
|--------|------|----------|-----------|
| `POST` | `/api/gastos` | CreateGasto | Criar gasto + debitar caixa (BR-021) |
| `GET` | `/api/gastos` | ListGastos | Listar gastos com filtros |
| `DELETE` | `/api/gastos/:id` | DeleteGasto | Soft delete (sem estorno) |

#### `POST /api/gastos`

**Request:**
```json
{
  "valor": 50.00,
  "categoria": "Transporte",
  "data": "2026-07-11",
  "observacao": "Combustível"
}
```

**Validações (zod):**
| Campo | Obrigatório | Regra |
|-------|------------|-------|
| valor | Sim | number, > 0 |
| categoria | Sim | string, 1-50 caracteres |
| data | Sim | string, formato AAAA-MM-DD |
| observacao | Não | string |

**Lógica (transação):**
1. Inserir `Gasto` na tabela `gastos`
2. Buscar `caixa_config` atual
3. Atualizar `caixa_config.caixaBase` (débito: `caixaBase - valor`)
4. Gerar `MovimentacaoFinanceira` (`tipo`: "saida", `origem`: "Gasto", `origemId`: id do gasto)

**Response 201:**
```json
{
  "id": "...",
  "valor": 50.00,
  "categoria": "Transporte",
  "observacao": "Combustível",
  "data": "2026-07-11",
  "createdAt": "2026-07-11T..."
}
```

**Possíveis erros:**
| Código | HTTP |
|--------|------|
| VALIDATION_ERROR | 422 |
| INSUFFICIENT_BALANCE | 422 |

#### `GET /api/gastos`

**Query params:**
| Parâmetro | Tipo | Obrigatório | Padrão |
|-----------|------|-------------|--------|
| dataInicio | string | Não | hoje |
| dataFim | string | Não | hoje |
| page | number | Não | 1 |
| limit | number | Não | 20 |

**Response 200:**
```json
{
  "data": [
    {
      "id": "...",
      "valor": 50.00,
      "categoria": "Transporte",
      "observacao": "Combustível",
      "data": "2026-07-11",
      "createdAt": "2026-07-11T10:00:00.000Z"
    }
  ],
  "totalPeriodo": 50.00,
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### `DELETE /api/gastos/:id`

Soft delete (seta `deletedAt`). **Não estorna o caixa** — o histórico financeiro é imutável (BR-029). Se o operador precisar corrigir, deve registrar um novo ajuste de caixa.

**Response:** `204 No Content`

### Registro em `main.ts`

```ts
import { gastoRoutes } from "./modules/gasto/presentation/routes/gasto.routes.js"
app.use("/api/gastos", gastoRoutes)
```

---

## Frontend — Módulo Caixa

### Estrutura de arquivos

```
frontend/src/modules/caixa/
  pages/
    CaixaPage.tsx
  components/
    CaixaIndicadores.tsx
  services/
    caixa.service.ts
```

### `caixa.service.ts`

```ts
export interface CaixaStatus {
  caixaBase: number
  saldoAtual: number
  recebidoSemana: number
  gastosSemana: number
  resultadoSemana: number
}

export interface MovimentacaoItem {
  id: string
  tipo: "entrada" | "saida"
  valor: number
  origem: string
  origemId?: string
  descricao?: string | null
  data: string
  createdAt: string
}

export async function getCaixaStatus(): Promise<CaixaStatus>
export async function ajustarCaixaBase(valor: number): Promise<{ caixaBase: number }>
export async function listarMovimentacoes(params?: {...}): Promise<PaginatedResponse<MovimentacaoItem>>
export async function liquidarSemana(): Promise<FechamentoSemanal>
```

### `CaixaPage.tsx` — Layout

```
┌─────────────────────────────────────────┐
│  ← Caixa                                │
│                                         │
│  ┌──────────┐ ┌──────────┐             │
│  │ Caixa    │ │ Saldo    │ [Liquidar   ]│
│  │ Base     │ │ Atual    │ [Semana →  ]│
│  │ R$1.500  │ │ R$1.320  │             │
│  └──────────┘ └──────────┘             │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │Recebido  │ │Gastos    │ │Resultado│ │
│  │Semana    │ │Semana    │ │Semana   │ │
│  │R$480     │ │R$180     │ │R$300    │ │
│  └──────────┘ └──────────┘ └─────────┘ │
│                                         │
│  ── AJUSTAR CAIXA BASE ──               │
│  [R$ ___________] [Salvar]             │
│                                         │
│  ── ÚLTIMAS MOVIMENTAÇÕES ──            │
│  ┌──────────────────────────────────┐   │
│  │ + R$60,00  Pagamento     11/07   │   │
│  │ - R$50,00  Gasto         11/07   │   │
│  │ - R$500,00 Contrato      10/07   │   │
│  │ Ver mais...                      │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Estados da interface:**
- **Carregando:** KPI cards com skeleton (pulse animation), lista com placeholder
- **Erro:** ErrorBanner com retry no topo
- **Sucesso (semana liquidada):** FeedbackOverlay "Semana liquidada." + recarregar indicadores
- **Vazio (sem movimentações):** Mensagem "Nenhuma movimentação no período."

**Interações:**
- Ajuste de caixa: formulário inline com input monetário + botão, chama `feedback.run()` com confirmação visual
- Liquidação semanal: ConfirmModal "Confirma liquidação da semana atual?" → chama API + feedback de sucesso
- Lista de movimentações: scroll vertical, últimas 20 por padrão

---

## Frontend — Módulo Gasto

### Estrutura de arquivos

```
frontend/src/modules/gasto/
  pages/
    GastoPage.tsx
  components/
    GastoForm.tsx
    GastoList.tsx
  services/
    gasto.service.ts
  schemas/
    gasto.schema.ts
```

### `gasto.service.ts`

```ts
export interface GastoItem {
  id: string
  valor: number
  categoria: string
  observacao?: string | null
  data: string
  createdAt: string
}

export async function createGasto(data: CreateGastoInput): Promise<GastoItem>
export async function listGastos(params?: {...}): Promise<{ data: GastoItem[]; totalPeriodo: number; pagination: {...} }>
export async function deleteGasto(id: string): Promise<void>
```

### `gasto.schema.ts`

```ts
import { z } from "zod"
import type { TFunction } from "i18next"

export const CATEGORIAS_GASTO = ["Transporte", "Alimentação", "Material", "Manutenção", "Outros"] as const

export function getGastoSchema(t: TFunction) {
  return z.object({
    valor: z.string({ required_error: t("gasto.validacao.valorObrigatorio") })
      .refine((v) => parseFloat(v.replace(",", ".")) > 0, t("gasto.validacao.valorPositivo")),
    categoria: z.string({ required_error: t("gasto.validacao.categoriaObrigatoria") })
      .min(1, t("gasto.validacao.categoriaObrigatoria")),
    data: z.string().min(1),
    observacao: z.string().optional(),
  })
}

export type GastoFormData = z.infer<ReturnType<typeof getGastoSchema>>
```

### `GastoPage.tsx` — Layout

```
┌─────────────────────────────────────────┐
│  ← Gastos                               │
│                                         │
│  ── NOVO GASTO ──                       │
│  Valor:      [R$ ______]               │
│  Categoria:  [Transporte     ▼]        │
│  Data:       [11/07/2026]              │
│  Observação: [_______________]         │
│  [Registrar Gasto]                     │
│                                         │
│  ── GASTOS DO DIA ──                    │
│  Total: R$ 50,00                        │
│  ┌──────────────────────────────────┐   │
│  │ 🚗 Transporte       R$ 50,00     │   │
│  │ Combustível           11/07   [✕]│   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ 🍽️ Alimentação      R$ 35,00     │   │
│  │ Almoço                11/07   [✕]│   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Categorias predefinidas:**
| Categoria | Ícone |
|-----------|-------|
| Transporte | 🚗 |
| Alimentação | 🍽️ |
| Material | 📦 |
| Manutenção | 🔧 |
| Outros | 📋 |

**Estados da interface:**
- **Carregando:** Skeleton no formulário e na lista
- **Erro ao criar:** FeedbackOverlay com mensagem de erro
- **Erro ao excluir:** FeedbackOverlay "Erro ao excluir gasto."
- **Sucesso ao criar:** FeedbackOverlay "Gasto registrado." + reset do formulário + recarregar lista
- **Vazio (sem gastos):** Mensagem "Nenhum gasto registrado hoje."
- **Antes de excluir:** ConfirmModal "Excluir este gasto?"

**Formulário (react-hook-form + zod):**
- `valor` → mask monetária (`maskMonetario`), unmask antes de enviar
- `categoria` → `<select>` com as 5 categorias predefinidas
- `data` → `<input type="date">`, default `new Date().toISOString().split("T")[0]`
- `observacao` → `<input type="text">` opcional
- Submit via `feedback.run()` com loading/success/error

---

## Frontend — Integração Dashboard

### `OperacoesDashboard.tsx`

Adicionar 2 chamadas de API:

```ts
const [caixaStatus, setCaixaStatus] = useState<CaixaStatus | null>(null)
const [gastosHoje, setGastosHoje] = useState(0)

const fetchCaixa = useCallback(async () => {
  try { const result = await getCaixaStatus(); setCaixaStatus(result) }
  catch { setCaixaStatus(null) }
}, [])

const fetchGastos = useCallback(async () => {
  try {
    const hoje = new Date().toISOString().split("T")[0]
    const result = await listGastos({ dataInicio: hoje, dataFim: hoje, limit: 1 })
    setGastosHoje(result.totalPeriodo)
  } catch { setGastosHoje(0) }
}, [])
```

### `IndicadoresCards.tsx`

Adicionar 2 novas props e 2 novos KpiCards:

```ts
interface IndicadoresCardsProps {
  // ... existentes
  caixaBase?: number        // novo — opcional (pode falhar o fetch)
  gastosHoje?: number       // novo — opcional
}

// No JSX, após os 4 cards existentes:
<KpiCard
  variant="gray"
  title={t("caixa.caixaBase")}
  value={`R$ ${formatCurrency(caixaBase ?? 0)}`}
  onClick={onCaixaClick}       // navega para /caixa
/>
<KpiCard
  variant="gray"
  title={t("gasto.totalHoje")}
  value={`R$ ${formatCurrency(gastosHoje ?? 0)}`}
  onClick={onGastosClick}      // navega para /gastos
/>
```

Grid ajusta de `grid-cols-2 sm:grid-cols-4` para `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` para acomodar 6 cards.

---

## Integração — Navbar, App.tsx, i18n

### `App.tsx` — Novas rotas

```tsx
import { CaixaPage } from "./modules/caixa/pages/CaixaPage.js"
import { GastoPage } from "./modules/gasto/pages/GastoPage.js"

<Route path="/caixa" element={<CaixaPage />} />
<Route path="/gastos" element={<GastoPage />} />
```

### `Navbar.tsx` — Novos links

```tsx
const links = [
  { to: "/",           label: t("nav.central") },
  { to: "/clientes",   label: t("nav.clientes") },
  { to: "/contratos",  label: t("nav.contratos") },
  { to: "/caixa",      label: t("nav.caixa") },      // novo
  { to: "/gastos",     label: t("nav.gastos") },     // novo
]
```

Com 5 links, o Navbar horizontal pode ficar apertado em mobile. Manter o layout atual — os links quebram naturalmente com flex-wrap.

### i18n — Novas chaves

Adicionar em `pt-BR.json`, `en.json`, `es.json`:

```json
{
  "nav": {
    "caixa": "Caixa",
    "gastos": "Gastos"
  },
  "caixa": {
    "title": "Caixa",
    "caixaBase": "Caixa Base",
    "saldoAtual": "Saldo Atual",
    "recebidoSemana": "Recebido Semana",
    "gastosSemana": "Gastos Semana",
    "resultadoSemana": "Resultado Semana",
    "ajustar": "Ajustar Caixa Base",
    "ajustarValor": "Novo valor",
    "ajustarSalvar": "Salvar Ajuste",
    "ajustarSucesso": "Caixa Base ajustado.",
    "movimentacoes": "Últimas Movimentações",
    "nenhumaMovimentacao": "Nenhuma movimentação no período.",
    "liquidar": "Liquidar Semana",
    "liquidarConfirmacao": "Confirma a liquidação da semana atual?",
    "liquidarSucesso": "Semana liquidada.",
    "erroCarregar": "Erro ao carregar dados do Caixa."
  },
  "gasto": {
    "title": "Gastos",
    "novo": "Novo Gasto",
    "valor": "Valor",
    "categoria": "Categoria",
    "data": "Data",
    "observacao": "Observação",
    "registrar": "Registrar Gasto",
    "sucesso": "Gasto registrado.",
    "totalHoje": "Gastos do Dia",
    "totalPeriodo": "Total do período",
    "erroCriar": "Erro ao registrar gasto.",
    "erroExcluir": "Erro ao excluir gasto.",
    "excluirConfirmacao": "Excluir este gasto?",
    "nenhumGasto": "Nenhum gasto registrado no período.",
    "validacao": {
      "valorObrigatorio": "Informe o valor.",
      "valorPositivo": "Valor deve ser maior que zero.",
      "categoriaObrigatoria": "Selecione uma categoria."
    }
  }
}
```

---

## Ordem de Execução

```
F1 (DB) → F2 (Backend Caixa) → F3 (Backend Gasto) → F4 (Frontend Services)
  → F5 (Frontend Caixa) → F6 (Frontend Gasto) → F7 (Integração) → F8 (Documentação)
```

F2 e F3 são independentes entre si e podem ser implementados em paralelo. F5 e F6 também são independentes. F7 depende de F5 e F6 concluídos.

---

## Impacto sobre outras demandas

| Demanda | Conflito? |
|---------|-----------|
| PLAN-013 (Dark Mode) | Nenhum — novos componentes já nascem com tokens estruturais (`bg-surface`, `text-text-primary`, etc.) |
| Fase 5 (Multi-usuário, PWA, Testes) | Nenhum — Caixa e Gasto são pré-requisitos para testes significativos |

---

## Referências

- `product/02-BUSINESS-RULES.md` — BR-018 a BR-028, BR-048 a BR-054
- `product/01-DOMAIN.md` — Entidades Caixa, Gasto, MovimentacaoFinanceira, FechamentoSemanal
- `product/04-ROADMAP.md` §4
- `engineering/01-DATABASE.md`
- `engineering/02-API.md`
- `engineering/04-BACKEND.md`
- `engineering/03-FRONTEND.md`
- `engineering/design/02-DESIGN-SYSTEM.md`

---

## Refinamento — Tela Caixa (11/07/2026)

### Motivação

As labels originais não estavam suficientemente claras para o operador. O layout também precisava proteger o ajuste de caixa contra toques acidentais e incluir indicadores do dia que estavam apenas no Dashboard.

### Mudanças no backend

- `GET /api/caixa`: adicionados 5 campos novos (`aReceberHoje`, `recebidoHoje`, `vendasSemana`, `ultimaLiquidacao`, `caixaUltimaLiquidacao`)
- Banco de dados: migration `ALTER TABLE fechamentos_semanais ADD COLUMN caixaBase` — snapshot do caixa no momento do fechamento
- `LiquidarSemanaUseCase`: salva `caixaBase` no registro de fechamento

### Mudanças no frontend

- Layout reorganizado em 3 seções: **Hoje** (3 cards), **Semana** (3 cards), **Caixa** (2 cards + info de fechamento)
- Ajuste de caixa movido para o final da tela (scroll-down necessário)
- Labels renomeadas para maior clareza (ex: "Caixa Base" → "Caixa Total", "Liquidar Semana" → "Fechar Semana")

### Mudanças no i18n

- 10 novas chaves (`caixa.aReceberHoje`, `caixa.cobradoHoje`, `caixa.vendasSemana`, `caixa.hoje`, `caixa.semana`, `caixa.ultimoFechamento`, `caixa.caixaNoFechamento`, etc.)
- 8 chaves renomeadas (`caixa.caixaBase` → "Caixa Total", `caixa.liquidar` → "Fechar Semana", etc.)
