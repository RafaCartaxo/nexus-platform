# PLAN-001-contrato — Plano de Implementação do Módulo Contrato

**Status:** Aprovado

**Versão:** 2.1

**Data:** 28/06/2026

---

## 1. Objetivo

Implementar o módulo **Contrato** como Vertical Slice completo, incluindo criação automática de parcelas, cálculo de juros e movimentação financeira no Caixa, seguindo estritamente a arquitetura, regras de negócio e documentação existentes.

---

## 2. Escopo

Dentro do escopo:

- Criar, listar, visualizar, editar e excluir contratos
- Cálculo automático do Valor Final (juros compostos simples: `ValorFinal = ValorBase × (1 + taxaJuros / 100)`)
- Geração automática de parcelas (valor igual, última parcela absorve residual de centavos)
- Débito automático do Caixa Base na criação do contrato (BR-019)
- Estorno automático do Caixa Base na exclusão do contrato
- Exclusão permitida apenas para contratos sem pagamentos registrados
- Edição permitida apenas para contratos sem pagamentos registrados (BR-006)
- Soft delete de contratos e parcelas
- Consulta de parcelas vinculadas ao contrato

Fora do escopo:

- Registro de pagamentos
- Cobrança de parcelas
- Indicadores financeiros / Dashboard
- Mapa
- Autenticação
- Módulo Caixa completo (indicadores, fechamento semanal)

---

## 3. Documentação Consultada

| Documento | Versão | Relevância |
|---|---|---|
| DOMAIN.md | 1.3 | Entidades Contrato, Parcela, MovimentaçãoFinanceira |
| BUSINESS-RULES.md | 1.3 | BR-001 a BR-009, BR-019, BR-022, BR-039 a BR-043 |
| ARCHITECTURE.md | 1.1 | Camadas, fluxo, princípios arquiteturais |
| DATABASE.md | 1.1 | Modelo de persistência, relacionamentos |
| API.md | 1.1 | Padrões de endpoints, validações, erros |
| BACKEND.md | 1.1 | Estrutura de módulos, Use Cases, Ports |
| FRONTEND.md | 1.0 | Camadas, páginas, componentes |
| CONVENTIONS.md | 1.1 | Nomenclatura, estrutura de módulos |
| ADR-001 | 1.1 | Arquitetura base do projeto |
| ADR-002 | 1.1 | Arquitetura do frontend |
| Código do módulo Cliente (backend + frontend) | — | Padrões de implementação |

---

## 4. Entidades Envolvidas

| Entidade | Origem | Ação |
|---|---|---|
| Contrato | DOMAIN.md | Criar |
| Parcela | DOMAIN.md | Criar |
| MovimentaçãoFinanceira | DOMAIN.md | Criar |
| Caixa (caixa_config) | DOMAIN.md | Criar (apenas registro do Caixa Base) |
| Cliente | DOMAIN.md | Relacionamento (já existe) |

---

## 5. Casos de Uso

| ID | Nome | Descrição |
|---|---|---|
| UC-01 | CreateContratoUseCase | Cria contrato, calcula valor final, gera parcelas, debita Caixa Base |
| UC-02 | FindContratoUseCase | Busca contrato por ID com parcelas |
| UC-03 | ListContratosUseCase | Lista contratos com paginação (filtro por clienteId) |
| UC-04 | UpdateContratoUseCase | Atualiza contrato (só sem pagamentos), recalcula parcelas e ajusta caixa |
| UC-05 | DeleteContratoUseCase | Soft delete contrato + parcelas, estorna Caixa Base |
| UC-06 | FinalizarContratoUseCase | (futuro) Automático quando todas parcelas estiverem pagas |

---

## 6. Fluxo Operacional

### Criação de Contrato

```
Operador → Tela Novo Contrato
  → seleciona cliente (select/search)
  → informa: valorBase, %juros (default 20%), qtdParcelas, dataInício
  → confirma
  → Sistema:
      1. Valida cliente existe
      2. Valida Caixa Base suficiente (caixaBase >= valorBase)
      3. Calcula valorFinal = valorBase * (1 + taxaJuros / 100)
      4. Gera N parcelas (valor igual, última com residual)
      5. Cria MovimentaçãoFinanceira (saída, -valorBase, origem='Contrato')
      6. Atualiza Caixa Base (caixaBase -= valorBase)
      7. Tudo em uma transação
  → Redireciona para Detalhe do Contrato
```

### Visualização

```
Operador → Lista de Contratos (filtrável por cliente)
  → clica em um contrato
  → Exibe: dados do contrato + lista de parcelas
```

### Edição (apenas sem pagamentos)

```
Operador → Detalhe do Contrato → Editar
  → Altera campos permitidos (valorBase, %juros, qtdParcelas)
  → confirma
  → Sistema:
      1. Valida contrato existe e não tem pagamentos
      2. Recalcula valorFinal
      3. Regera parcelas (exclui as antigas, cria novas)
      4. Ajusta Caixa Base pela diferença (se valorBase mudou)
      5. Tudo em uma transação
  → Redireciona para Detalhe do Contrato
```

### Exclusão (apenas sem pagamentos)

```
Operador → Detalhe do Contrato → Excluir
  → confirma
  → Sistema:
      1. Valida contrato existe e não tem pagamentos
      2. Soft delete contrato (deletedAt)
      3. Soft delete parcelas (deletedAt)
      4. Cria MovimentaçãoFinanceira (entrada, +valorBase, origem='Cancelamento')
      5. Atualiza Caixa Base (caixaBase += valorBase)
      6. Tudo em uma transação
  → Redireciona para Lista de Contratos
```

---

## 7. Impactos

| Módulo / Arquivo | Impacto |
|---|---|
| `src/database.ts` | Novas tabelas: `contratos`, `parcelas`, `movimentacoesFinanceiras`, `caixa_config` |
| `src/main.ts` | Registrar novas rotas: `app.use("/api/contratos", contratoRoutes)` |
| Módulo Cliente | `GET /api/clientes/{id}` retornará `totalContratos` (calcular via COUNT) |
| Módulo Caixa | Tabela `caixa_config` criada como placeholder; módulo oficial será implementado futuramente |
| `frontend/src/App.tsx` | Registrar novas rotas: `/contratos`, `/contratos/novo`, `/contratos/:id`, `/contratos/:id/editar` |

---

## 8. Planejamento Técnico

### 8.1 Persistência

**Tabela `contratos`:**

```sql
CREATE TABLE IF NOT EXISTS contratos (
  id TEXT PRIMARY KEY,
  clienteId TEXT NOT NULL,
  valorBase REAL NOT NULL,
  percentualJuros REAL NOT NULL,
  valorFinal REAL NOT NULL,
  quantidadeParcelas INTEGER NOT NULL,
  dataInicio TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Ativo',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  deletedAt TEXT,
  FOREIGN KEY (clienteId) REFERENCES clientes(id)
)
```

**Tabela `parcelas`:**

```sql
CREATE TABLE IF NOT EXISTS parcelas (
  id TEXT PRIMARY KEY,
  contratoId TEXT NOT NULL,
  numero INTEGER NOT NULL,
  valorPrevisto REAL NOT NULL,
  valorPago REAL NOT NULL DEFAULT 0,
  saldoPendente REAL NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Pendente',
  dataVencimento TEXT NOT NULL,
  dataQuitacao TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  deletedAt TEXT,
  FOREIGN KEY (contratoId) REFERENCES contratos(id)
)
```

**Tabela `movimentacoesFinanceiras`:**

```sql
CREATE TABLE IF NOT EXISTS movimentacoesFinanceiras (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL,
  valor REAL NOT NULL,
  origem TEXT NOT NULL,
  origemId TEXT NOT NULL,
  descricao TEXT,
  data TEXT NOT NULL,
  createdAt TEXT NOT NULL
)
```

**Tabela `caixa_config`:**

```sql
CREATE TABLE IF NOT EXISTS caixa_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  caixaBase REAL NOT NULL DEFAULT 0,
  updatedAt TEXT NOT NULL
)
```

Os schemas Drizzle correspondentes devem ser adicionados em `src/database.ts`.

### 8.2 Backend

**Estrutura de diretórios:**

```
src/modules/contrato/
  domain/
    contrato.entity.ts
    errors/
      contrato-not-found.error.ts
      contrato-has-payments.error.ts
      saldo-insuficiente.error.ts
    services/
      gerar-parcelas.ts
  application/
    ports/
      contrato.repository.ts
    use-cases/
      CreateContrato/
        CreateContratoUseCase.ts
        CreateContratoInput.ts
      FindContrato/
        FindContratoUseCase.ts
      ListContratos/
        ListContratosUseCase.ts
        ListContratosQuery.ts
      UpdateContrato/
        UpdateContratoUseCase.ts
        UpdateContratoInput.ts
      DeleteContrato/
        DeleteContratoUseCase.ts
  infrastructure/
    repositories/
      contrato.repository.impl.ts
  presentation/
    controllers/
      contrato.controller.ts
    routes/
      contrato.routes.ts
```

**Regras de implementação:**

- Classes para Use Cases, Repositories, Controllers (mesmo padrão do Cliente)
- Interfaces para entidades de domínio
- Cada Use Case em sua própria pasta (Model B): `CreateContrato/CreateContratoUseCase.ts`
- Zod schemas e inputs em arquivo separado dentro da pasta do Use Case (`CreateContratoInput.ts`)
- Queries de listagem em arquivo separado (`ListContratosQuery.ts`)
- Repository port (`IContratoRepository`) com métodos: `save`, `findById`, `findAll`, `update`, `softDelete`, `findParcelasByContratoId`, `hasPayments`, `getCaixaBase`, `updateCaixaBase`
- Use Cases injetam repositório via construtor
- Controllers instanciam Use Cases no construtor (mesmo padrão do Cliente)
- Rotas criam `Router`, instanciam repository e controller, exportam `contratoRoutes`

**Transação no CreateContratoUseCase:**

O Use Case deve usar `BEGIN/COMMIT/ROLLBACK` manual via `sqlite.exec()`, pois o better-sqlite3 não suporta `async` dentro de `drizzle.transaction()`.

```
sqlite.exec("BEGIN TRANSACTION")
try {
  1. Inserir contrato
  2. Inserir N parcelas
  3. Inserir movimentacaoFinanceira (saída, -valorBase, origem='Contrato')
  4. Atualizar caixa_config (caixaBase -= valorBase)
  sqlite.exec("COMMIT")
} catch (error) {
  sqlite.exec("ROLLBACK")
  throw error
}
```

**Geração de parcelas:**

```
valorFinal = valorBase * (1 + percentualJuros / 100)
parcelaBase = Math.floor(valorFinal / quantidadeParcelas * 100) / 100
residual = Math.round((valorFinal - parcelaBase * quantidadeParcelas) * 100) / 100

Para cada parcela i (1 a N):
  valorPrevisto = parcelaBase + (0.01 se i == N e residual > 0)
  dataVencimento = dataInicio + (i + 1) dia   // periodicidade configurável futuramente
  Se dataVencimento for domingo, ajustar para o próximo dia (segunda-feira)  // BR-042
  saldoPendente = valorPrevisto
  estado = "Pendente"
```

**Validações (Zod):**

```
createContratoSchema:
  clienteId: z.string().uuid()
  valorBase: z.number().positive("Valor base deve ser positivo")
  percentualJuros: z.number().min(0).default(20)
  quantidadeParcelas: z.number().int().positive()
  dataInicio: z.string().min(1, "Campo obrigatório")

updateContratoSchema:
  mesmos campos, todos opcionais
```

**Error codes:**

| Código | HTTP | Quando |
|---|---|---|
| VALIDATION_ERROR | 422 | Dados inválidos |
| CONTRACT_NOT_FOUND | 404 | Contrato não encontrado |
| CONTRACT_HAS_PAYMENTS | 409 | Tentativa de editar/excluir contrato com pagamentos |
| CLIENT_NOT_FOUND | 404 | Cliente informado não existe |
| INSUFFICIENT_BALANCE | 422 | Caixa Base insuficiente para criar contrato |

### 8.3 Frontend

**Estrutura de diretórios:**

```
frontend/src/modules/contrato/
  components/
    ContratoInfo.tsx
    ParcelaList.tsx
  pages/
    ContratoList.tsx
    ContratoNovo.tsx
    ContratoDetail.tsx
    ContratoEdit.tsx
  services/
    contrato.service.ts
```

**Rotas (App.tsx):**

```tsx
<Route path="/contratos" element={<ContratoList />} />
<Route path="/contratos/novo" element={<ContratoNovo />} />
<Route path="/contratos/:id" element={<ContratoDetail />} />
<Route path="/contratos/:id/editar" element={<ContratoEdit />} />
```

**ContratoNovo.tsx — formulário:**
- Select de cliente (carregar lista de clientes via API)
- Valor Base (input number, R$)
- Percentual de Juros (input number, %, default 20)
- Quantidade de Parcelas (input number)
- Data de Início (input date)
- Exibição do Valor Final (calculado em tempo real conforme preenche)
- Botão Salvar

**ContratoDetail.tsx — layout:**
- ContratoInfo: grid 2 colunas (Valor Emprestado, Total a Receber, Parcelas, Valor da Parcela, Data de Início, Previsão de Término, Juros, Status)
- ParcelaList: grid responsivo de cards (número, valorPrevisto, vencimento, status com badge colorido)
- Botões: Editar (visível só se sem pagamentos), Excluir (visível só se sem pagamentos)

**ContratoList.tsx — listagem:**
- Filtro por cliente (select/search)
- Cards ou tabela: nome do cliente, valorFinal, qtdParcelas, estado
- Paginação
- Link para detalhe

**ContratoEdit.tsx — formulário:**
- Mesma estrutura do Novo, campos pré-preenchidos
- Se houver pagamentos, campos desabilitados e mensagem informativa

**Validações frontend (apenas formato):**
- valorBase > 0
- percentualJuros >= 0
- quantidadeParcelas >= 1
- dataInício obrigatória
- cliente obrigatório

**Estados de interface:**
- Loading: skeleton enquanto carrega
- Error: mensagem + "Tentar novamente"
- Empty: "Nenhum contrato encontrado"
- Sucesso: feedback implícito (navegação)

---

## 9. Pendências

1. **Transações Drizzle**: o módulo Cliente atual não usa transações. O `ContratoRepository` precisará receber `tx` como parâmetro nos métodos ou o Use Case deve gerenciar a transação diretamente com `db.transaction()`.

2. **Caixa Base inicial**: a tabela `caixa_config` precisa de um registro inicial. Sugere-se inserir um registro com `caixaBase = 0` no `createTables()`. O operador poderá ajustar via funcionalidade futura (BR-018).

3. **ClienteRepository**: o Use Case precisará validar a existência do cliente. O `IClienteRepository` já existe e possui `findById`. O `ContratoController` pode receber ambos os repositórios, ou o `CreateContratoUseCase` pode receber o `IClienteRepository` como dependência adicional.

4. **Recálculo no Update**: se `valorBase` mudar, criar movimentação financeira de ajuste (diferença) em vez de reverter e recriar a movimentação original.

5. **Soft delete na edição**: ao editar um contrato, as parcelas antigas devem receber soft delete (preservando o histórico), não hard delete. Isto é consistente com a regra do DATABASE.md que proíbe remoção física de entidades financeiras.

---

## 10. Ordem de Implementação

| # | O quê | Arquivos | Depende de |
|---|---|---|---|
| 1 | Database: novas tabelas | `src/database.ts` | — |
| 2 | Domain entities | `domain/*.entity.ts` | — |
| 3 | Domain errors | `domain/errors/*.error.ts` | — |
| 4 | Repository port | `application/ports/contrato.repository.ts` | 2 |
| 5 | Use Cases: Find + List | `application/use-cases/FindContrato/FindContratoUseCase.ts`, `application/use-cases/ListContratos/ListContratosUseCase.ts` | 4 |
| 6 | Use Case: Create (com parcelas + mov financeira) | `application/use-cases/CreateContrato/CreateContratoUseCase.ts` | 4, 5 |
| 7 | Use Case: Update | `application/use-cases/UpdateContrato/UpdateContratoUseCase.ts` | 4, 5 |
| 8 | Use Case: Delete (com estorno) | `application/use-cases/DeleteContrato/DeleteContratoUseCase.ts` | 4, 5 |
| 9 | Repository implementation | `infrastructure/repositories/contrato.repository.impl.ts` | 1, 4 |
| 10 | Controller | `presentation/controllers/contrato.controller.ts` | 5-9 |
| 11 | Routes | `presentation/routes/contrato.routes.ts` | 10 |
| 12 | Registrar rota no servidor | `src/main.ts` | 11 |
| 13 | Frontend service | `services/contrato.service.ts` | 11 |
| 14 | Frontend: ContratoInfo component | `components/ContratoInfo.tsx` | — |
| 15 | Frontend: ParcelaList component | `components/ParcelaList.tsx` | — |
| 16 | Frontend: ContratoList page | `pages/ContratoList.tsx` | 13, 14 |
| 17 | Frontend: ContratoDetail page | `pages/ContratoDetail.tsx` | 13, 14, 15 |
| 18 | Frontend: ContratoNovo page | `pages/ContratoNovo.tsx` | 13, 14 |
| 19 | Frontend: ContratoEdit page | `pages/ContratoEdit.tsx` | 13, 14 |
| 20 | Registrar rotas frontend | `frontend/src/App.tsx` | 16-19 |
| 21 | Ajustar GET /api/clientes/{id} (totalContratos) | `src/modules/cliente/.../FindCliente/FindClienteUseCase.ts` | 1 |

---

## 11. Critérios de Conclusão

- [ ] Backend compila sem erros de TypeScript
- [ ] Frontend compila sem erros de TypeScript
- [ ] `POST /api/contratos` retorna 201 com contrato + parcelas
- [ ] `ValorFinal` calculado corretamente: `valorBase * (1 + taxaJuros / 100)`
- [ ] Parcelas geradas com valores corretos (última absorve residual de centavos)
- [ ] Caixa Base debitado corretamente na criação (BR-019)
- [ ] `GET /api/contratos` retorna lista paginada
- [ ] `GET /api/contratos?clienteId=X` filtra por cliente
- [ ] `GET /api/contratos/{id}` retorna contrato com parcelas
- [ ] `PATCH /api/contratos/{id}` atualiza e recalcula (se sem pagamentos) retorna 200
- [ ] `PATCH /api/contratos/{id}` retorna 409 se houver pagamentos
- [ ] `DELETE /api/contratos/{id}` soft delete + estorno do caixa (se sem pagamentos) retorna 204
- [ ] `DELETE /api/contratos/{id}` retorna 409 se houver pagamentos
- [ ] `GET /api/clientes/{id}` inclui `totalContratos`
- [ ] Frontend: criar contrato com formulário completo, redireciona ao sucesso
- [ ] Frontend: listar contratos com filtro por cliente e paginação
- [ ] Frontend: visualizar detalhe do contrato com lista de parcelas
- [ ] Frontend: editar contrato (botão desabilitado se houver pagamentos)
- [ ] Frontend: excluir contrato (botão desabilitado se houver pagamentos)
- [ ] Estados de loading, erro e vazio em todas as telas
- [ ] Navegação entre cliente e contratos funcionando (via detail do cliente)
- [ ] Valor Final atualizado em tempo real no formulário de criação

---

## 12. Referências

- DOMAIN.md
- BUSINESS-RULES.md
- ARCHITECTURE.md
- DATABASE.md
- API.md
- BACKEND.md
- FRONTEND.md
- CONVENTIONS.md
- ADR-001
- ADR-002
- PLAN-001-contrato (versão anterior)
