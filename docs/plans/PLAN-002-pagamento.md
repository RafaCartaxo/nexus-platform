# PLAN-002-pagamento — Plano de Implementação do Módulo Pagamento

**Status:** Aprovado

**Versão:** 1.0

**Data:** 29/06/2026

---

## 1. Objetivo

Implementar o módulo **Pagamento** como Vertical Slice completo, incluindo distribuição automática entre parcelas, atualização de saldos, finalização automática de contratos, movimentação financeira e crédito no Caixa Base, seguindo estritamente a arquitetura, regras de negócio e documentação existentes.

---

## 2. Escopo

Dentro do escopo:

- Registrar pagamentos avulsos (sem valor fixo por parcela)
- Distribuir automaticamente o valor recebido entre parcelas pendentes em ordem crescente (BR-044, BR-045)
- Atualizar estado das parcelas: **Pendente** → **Parcial** ou **Paga**
- Atualizar `dataQuitacao` da parcela quando integralmente paga
- Finalizar contrato automaticamente quando todas as parcelas atingirem **Paga** (BR-046)
- Creditar o valor recebido no Caixa Base (BR-020)
- Registrar Movimentação Financeira com origem `"Pagamento"`
- Listar pagamentos de um contrato com detalhes de distribuição entre parcelas
- Frontend: modal de pagamento com máscara monetária centavos-based
- Frontend: coloração de cards de parcela por status (amarelo/azul/verde)
- Frontend: resumo de contagem de parcelas por status
- Frontend: `saldoPendente` agregado no retorno da lista de contratos

Fora do escopo:

- Edição de pagamento
- Estorno de pagamento
- Pagamento recorrente / agendado
- Boleto / link de pagamento
- Relatório de pagamentos por período
- Indicadores financeiros / Dashboard

---

## 3. Documentação Consultada

| Documento | Versão | Relevância |
|---|---|---|
| DOMAIN.md | 1.3 | Entidades Pagamento, PagamentoParcela, MovimentaçãoFinanceira |
| BUSINESS-RULES.md | 1.3 | BR-010 a BR-016, BR-020, BR-044 a BR-047 |
| ARCHITECTURE.md | 1.1 | Camadas, fluxo, princípios arquiteturais |
| DATABASE.md | 1.1 | Modelo de persistência, relacionamentos |
| API.md | 1.1 | Endpoints de pagamento, validações, erros |
| BACKEND.md | 1.1 | Estrutura de módulos, Use Cases, Ports |
| FRONTEND.md | 1.0 | Camadas, páginas, componentes |
| CONVENTIONS.md | 1.1 | Nomenclatura, estrutura de módulos |
| ADR-001 | 1.1 | Arquitetura base do projeto |
| ADR-002 | 1.1 | Arquitetura do frontend |
| UX.md | 1.0 | Core task "Registro de Pagamento" em até 10s |
| PLAN-001-contrato | 2.1 | Módulo Contrato (entidades de Parcela, contrato) |
| Código do módulo Contrato (backend + frontend) | — | Padrões de implementação, repositório com transação |

---

## 4. Entidades Envolvidas

| Entidade | Origem | Ação |
|---|---|---|
| Pagamento | DOMAIN.md | Criar |
| PagamentoParcela | DOMAIN.md | Criar |
| Parcela | DOMAIN.md / PLAN-001 | Atualizar (valorPago, saldoPendente, estado, dataQuitacao) |
| Contrato | DOMAIN.md / PLAN-001 | Atualizar (estado → Finalizado) |
| MovimentaçãoFinanceira | DOMAIN.md | Criar (origem = "Pagamento") |
| Caixa (caixa_config) | DOMAIN.md | Atualizar (caixaBase += valor) |

---

## 5. Casos de Uso

| ID | Nome | Descrição |
|---|---|---|
| UC-01 | CreatePagamentoUseCase | Registra pagamento, distribui entre parcelas pendentes, atualiza estado, credita caixa, gera movimentação financeira |
| UC-02 | ListPagamentosUseCase | Lista pagamentos de um contrato com detalhes de distribuição por parcela |

---

## 6. Fluxo Operacional

### Registro de Pagamento

```
Operador → Detalhe do Contrato
  → clica em card de parcela Pendente ou Parcial
  → Modal de Pagamento é aberto
  → informa valor (máscara monetária centavos-based)
  → confirma
  → Sistema:
      1. Valida contrato existe
      2. Valida valor não excede saldo devedor total
      3. Filtra parcelas com saldoPendente > 0, ordena por número crescente
      4. Distribui valor: para cada parcela, aplica min(restante, saldoPendente)
      5. Atualiza cada parcela: valorPago += aplicado, saldoPendente -= aplicado
         - Se saldoPendente = 0 → estado = "Paga", dataQuitacao = hoje
         - Se saldoPendente > 0 → estado = "Parcial"
      6. Se todas parcelas estão Paga → contrato.estado = "Finalizado"
      7. Registra MovimentaçãoFinanceira (entrada, +valor, origem = "Pagamento")
      8. Atualiza Caixa Base (caixaBase += valor)
      9. Tudo em uma transação (BEGIN/COMMIT/ROLLBACK)
  → Modal fecha, tela de detalhe é atualizada
```

### Visualização de Pagamentos

```
Operador → Detalhe do Contrato
  → Seção de pagamentos (futuro: lista de pagamentos realizados)
```

---

## 7. Impactos

| Módulo / Arquivo | Impacto |
|---|---|
| `src/database.ts` | Novas tabelas: `pagamentos`, `pagamento_parcelas` |
| `src/main.ts` | Registrar nova rota: `app.use("/api/pagamentos", pagamentoRoutes)` |
| Módulo Contrato | `IContratoRepository` ganha `updateParcela(id, data)` |
| Módulo Contrato | `IContratoRepository` ganha `transaction()` e `saveMovimentacaoFinanceira()` |
| Módulo Contrato | `ContratoRepository` implementa `updateParcela` (UPDATE, não INSERT) |
| Módulo Contrato | `Contrato` response no list ganha `saldoPendente` (aggregate SUM) |
| `frontend/src/App.tsx` | Nenhuma rota nova (pagamento via modal no detail do contrato) |
| `frontend/src/shared/utils/masks.ts` | Novas funções: `maskMonetario`, `unmaskMonetario` |
| `frontend/src/shared/utils/` | Novo utilitário: `formatarData` (dd/mm) |
| `docs/api-collection.json` | Endpoints de pagamento adicionados |

---

## 8. Planejamento Técnico

### 8.1 Persistência

**Tabela `pagamentos`:**

```sql
CREATE TABLE IF NOT EXISTS pagamentos (
  id TEXT PRIMARY KEY,
  contratoId TEXT NOT NULL,
  valor REAL NOT NULL,
  data TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (contratoId) REFERENCES contratos(id)
);
```

**Tabela `pagamento_parcelas`:**

```sql
CREATE TABLE IF NOT EXISTS pagamento_parcelas (
  id TEXT PRIMARY KEY,
  pagamentoId TEXT NOT NULL,
  parcelaId TEXT NOT NULL,
  valor REAL NOT NULL,
  FOREIGN KEY (pagamentoId) REFERENCES pagamentos(id),
  FOREIGN KEY (parcelaId) REFERENCES parcelas(id)
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_contrato ON pagamentos(contratoId);
CREATE INDEX IF NOT EXISTS idx_pagamento_parcelas_pagamento ON pagamento_parcelas(pagamentoId);
CREATE INDEX IF NOT EXISTS idx_pagamento_parcelas_parcela ON pagamento_parcelas(parcelaId);
```

Os schemas Drizzle correspondentes estão em `src/database.ts`.

### 8.2 Backend

**Estrutura de diretórios:**

```
src/modules/pagamento/
  domain/
    pagamento.entity.ts
  application/
    ports/
      pagamento.repository.ts
    use-cases/
      CreatePagamento/
        CreatePagamentoUseCase.ts
        CreatePagamentoInput.ts
      ListPagamentos/
        ListPagamentosUseCase.ts
  infrastructure/
    repositories/
      pagamento.repository.impl.ts
  presentation/
    controllers/
      pagamento.controller.ts
    routes/
      pagamento.routes.ts
```

**Alterações no módulo Contrato:**

- `application/ports/contrato.repository.ts`: adicionar métodos:
  - `updateParcela(id: string, data: Partial<Parcela>): Promise<void>`
  - `transaction<T>(fn: (repo: IContratoRepository) => Promise<T>): Promise<T>`
  - `saveMovimentacaoFinanceira(mov: MovimentacaoFinanceira): Promise<void>`
  - `updateCaixaBase(valor: number): Promise<void>`
  - `findByIdWithParcelas(id: string): Promise<ContratoComParcelas | null>`

- `infrastructure/repositories/contrato.repository.impl.ts`: implementar métodos:
  - `updateParcela(id, data)`: `UPDATE parcelas SET ... WHERE id = ?`
  - `transaction(fn)`: `BEGIN TRANSACTION` → executa fn → `COMMIT` / `ROLLBACK`
  - `saveMovimentacaoFinanceira(mov)`: `INSERT INTO movimentacoesFinanceiras`
  - `updateCaixaBase(valor)`: `UPDATE caixa_config SET caixaBase = caixaBase + valor`
  - `findByIdWithParcelas(id)`: JOIN contrato + parcelas

- `findAll()` no repositório: adicionar `saldoPendente` agregado via `SELECT SUM(saldoPendente) FROM parcelas WHERE contratoId IN (...)` com fallback para `valorFinal`.

**Algoritmo de distribuição (CreatePagamentoUseCase):**

```
1. Buscar contrato com parcelas (findByIdWithParcelas)
2. Validar contrato existe
3. Filtrar parcelas com saldoPendente > 0, ordenar por numero ASC
4. Calcular saldoDevedor = SUM(saldoPendente)
5. Validar valor <= saldoDevedor
6. Distribuir:
   restante = valor
   para cada parcela:
     aplicar = min(restante, parcela.saldoPendente)
     distribuicao.push({ parcela, valor: aplicar })
     restante -= aplicar
7. Dentro da transação:
   a. INSERT pagamento
   b. Para cada item da distribuição:
      - Calcular novoValorPago, novoSaldo
      - Determinar novoEstado (Paga se saldo = 0, Parcial se > 0)
      - UPDATE parcela SET valorPago, saldoPendente, estado, dataQuitacao, updatedAt
      - INSERT pagamento_parcelas (vinculo)
   c. Se todas parcelas Paga → UPDATE contrato SET estado = 'Finalizado'
   d. INSERT movimentacoesFinanceiras (entrada, Pagamento)
   e. UPDATE caixa_config SET caixaBase += valor
```

**Validações (CreatePagamentoInput - Zod):**

```
createPagamentoSchema:
  contratoId: z.string().uuid()
  valor: z.number().positive("Valor deve ser positivo")
```

**Error codes:**

| Código | HTTP | Quando |
|---|---|---|
| VALIDATION_ERROR | 422 | Dados inválidos |
| CONTRACT_NOT_FOUND | 404 | Contrato não encontrado |
| INSUFFICIENT_BALANCE | 422 | Valor do pagamento excede saldo devedor |

### 8.3 Frontend

**Estrutura de diretórios (novos/alterados):**

```
frontend/src/modules/pagamento/
  components/
    PagamentoModal.tsx           ← NOVO
```

**Alterações em módulos existentes:**

- `frontend/src/modules/contrato/components/ParcelaList.tsx`:
  - Cards coloridos por status: Pendente (yellow-50/yellow-200), Parcial (blue-50/blue-200), Paga (green-50/green-200)
  - Conteúdo do card varia por status: Pendente → valorPrevisto, Paga → "✓ Pago", Parcial → "Resta" + saldoPendente
  - Badge substituído por dot colorido (h-2 w-2 rounded-full)
  - Cards Paga: cursor-default, sem hover shadow
  - Cards Pendente/Parcial: clicáveis → abrem PagamentoModal
  - Summary row acima do grid: "● Pagas: N ● Parciais: N ● Pendentes: N"
  - Usa novo utilitário `formatarData` (shared)

- `frontend/src/modules/contrato/components/ContratoInfo.tsx`:
  - Reordenado: grid 2 colunas (Saldo Devedor xl bold + Recebido sm right)
  - Demais info em grids text-sm
  - Datas formatadas como dd/mm/yyyy (completo)

- `frontend/src/modules/contrato/pages/ContratoList.tsx`:
  - Card: date top-right (text-[10px] gray), Saldo Devedor label, badge segunda linha, "6x •" format
  - Usa `R$` pattern (text-sm font-medium text-gray-500)
  - Usa novo utilitário `formatarData` (shared)

- `frontend/src/shared/utils/masks.ts`:
  - `maskMonetario(valorCentavos: number)`: formata como `R$ 1.234,56` usando `toLocaleString("pt-BR")`
  - `unmaskMonetario(valor: string)`: extrai número em centavos da string formatada

- `frontend/src/shared/utils/formatarData.ts`:
  - `formatarData(data: string)`: retorna dd/mm usando `parseDateLocal` + `toLocaleDateString`

**PagamentoModal.tsx — comportamento:**
- Recebe `contratoId`, `isOpen`, `onClose`, `onSuccess`
- Input com máscara monetária centavos-based (state interno `rawValor` em centavos)
- Valida valor > 0
- POST `/api/pagamentos` com `{ contratoId, valor }`
- Loading state durante requisição
- Fecha modal e chama `onSuccess` ao finalizar

**Estados de interface:**
- Loading: spinner/botão desabilitado durante requisição
- Error: toast/mensagem de erro (contrato não encontrado, saldo insuficiente)
- Sucesso: modal fecha, tela recarrega dados

---

## 9. Pendências

1. **Exibição de pagamentos no ContratoDetail**: atualmente não há uma seção dedicada para listar pagamentos realizados. O GET `/api/pagamentos/contrato/{contratoId}` existe, mas não é consumido no frontend.

2. **Transações no repositório**: o `ContratoRepository` usa `BEGIN/COMMIT/ROLLBACK` manual via `sqlite.exec()` dentro do método `transaction()`. Isto funciona mas foge do padrão Drizzle. Uma melhoria futura seria usar `drizzle.transaction()` se o driver suportar.

3. **Atualização de lista ao pagar**: após pagamento, o frontend recarrega o contrato, mas a lista de contratos (ContratoList) não reflete o novo saldoPendente até que o usuário navegue de volta.

---

## 10. Ordem de Implementação

| # | O quê | Arquivos | Depende de |
|---|---|---|---|
| 1 | Database: novas tabelas pagamentos + pagamento_parcelas | `src/database.ts` | — |
| 2 | Domain entity Pagamento | `domain/pagamento.entity.ts` | — |
| 3 | Repository port IPagamentoRepository | `application/ports/pagamento.repository.ts` | 2 |
| 4 | Adicionar métodos ao IContratoRepository (updateParcela, transaction, etc.) | `application/ports/contrato.repository.ts` | — |
| 5 | Implementar métodos no ContratoRepository | `infrastructure/repositories/contrato.repository.impl.ts` | 4 |
| 6 | Adicionar saldoPendente ao findAll | `infrastructure/repositories/contrato.repository.impl.ts` | — |
| 7 | Use Case: CreatePagamento | `application/use-cases/CreatePagamento/` | 3, 5 |
| 8 | Use Case: ListPagamentos | `application/use-cases/ListPagamentos/` | 3 |
| 9 | PagamentoRepository implementation | `infrastructure/repositories/pagamento.repository.impl.ts` | 1, 3 |
| 10 | Controller | `presentation/controllers/pagamento.controller.ts` | 7, 8 |
| 11 | Routes | `presentation/routes/pagamento.routes.ts` | 10 |
| 12 | Registrar rota no servidor | `src/main.ts` | 11 |
| 13 | Frontend: máscara monetária | `shared/utils/masks.ts` | — |
| 14 | Frontend: formatarData utility | `shared/utils/formatarData.ts` | — |
| 15 | Frontend: ParcelaList (cores, conteúdo por status, dot, summary, formatarData) | `components/ParcelaList.tsx` | 14 |
| 16 | Frontend: ContratoInfo (reorder, formatarData) | `components/ContratoInfo.tsx` | 14 |
| 17 | Frontend: ContratoList (saldoPendente, formatarData, R$ pattern) | `pages/ContratoList.tsx` | 14 |
| 18 | Frontend: PagamentoModal | `components/PagamentoModal.tsx` | 13 |
| 19 | Documentar no Contrato type o campo saldoPendente | `services/contrato.service.ts` | — |

---

## 11. Critérios de Conclusão

- [x] Backend compila sem erros de TypeScript
- [x] Frontend compila sem erros de TypeScript
- [x] `POST /api/pagamentos` retorna 201 com pagamento registrado
- [x] Distribuição correta do valor entre parcelas em ordem crescente (BR-044, BR-045)
- [x] Parcelas totalmente quitadas recebem estado **Paga** e `dataQuitacao`
- [x] Parcelas parcialmente quitadas recebem estado **Parcial**
- [x] Contrato alterado para **Finalizado** quando todas parcelas pagas (BR-046)
- [x] Caixa Base creditado corretamente (BR-020)
- [x] Movimentação Financeira registrada com origem "Pagamento"
- [x] `GET /api/pagamentos/contrato/{contratoId}` retorna pagamentos com distribuição
- [x] `GET /api/contratos` retorna `saldoPendente` agregado
- [x] Frontend: input com máscara monetária centavos-based
- [x] Frontend: ParcelaList com cores, conteúdo variável por status, dot, summary row
- [x] Frontend: ContratoInfo com hierarquia reorganizada
- [x] Frontend: ContratoList com `saldoPendente` e `R$` pattern
- [x] Estados de loading, erro e vazio no PagamentoModal

---

## 12. Referências

- DOMAIN.md
- BUSINESS-RULES.md
- ARCHITECTURE.md
- DATABASE.md
- API.md
- BACKEND.md
- FRONTEND.md
- UX.md
- CONVENTIONS.md
- ADR-001
- ADR-002
- PLAN-001-contrato
