# PLAN-009 — Atendimento de Cobrança

**Status:** Concluído

**Versão:** 1.0

**Conclusão:** 11/07/2026

---

# Objetivo

Padronizar o conceito de Atendimento de Cobrança dentro do sistema, definindo os possíveis resultados de uma tentativa de cobrança e preparando a evolução futura da Central de Operações.

Esta entrega não altera regras financeiras, contratos, parcelas ou pagamentos.

Seu objetivo é apenas organizar o fluxo operacional do operador.

---

# Problema

Atualmente a Central de Operações registra ações como:

- Visitado
- Não encontrado
- Promessa

Entretanto esses registros ainda não possuem um significado oficial dentro do domínio.

Como consequência:

- cada tela interpreta esses estados de forma diferente;
- a ordenação torna-se inconsistente;
- futuras funcionalidades (histórico, métricas, contatos e inteligência operacional) tornam-se difíceis de implementar.

---

# Objetivo da melhoria

Definir oficialmente o conceito de Atendimento.

Todo contato realizado com um cliente durante uma cobrança representa um Atendimento.

Cada Atendimento produz um único Resultado Operacional.

O resultado operacional nunca altera automaticamente a situação financeira da cobrança.

---

# Conceitos

## Situação Financeira

Representa a situação do débito.

Exemplos:

- Atrasado
- Vence Hoje
- Futuro
- Parcial
- Pago

É governada pelas regras financeiras do sistema.

---

## Atendimento

Representa uma interação realizada pelo operador.

Exemplos:

- visita presencial;
- ligação;
- WhatsApp;
- outro contato futuro.

Cada atendimento gera um único Resultado Operacional.

---

## Resultado Operacional

Representa o resultado do último atendimento realizado.

Nesta primeira versão existirão apenas quatro resultados.

---

### PENDENTE

Nenhum atendimento foi realizado.

É o estado inicial.

---

### VISITADO

O operador realizou atendimento presencial.

Nenhuma nova ação foi registrada.

---

### NAO_ENCONTRADO

Foi realizada tentativa de atendimento.

O cliente não foi localizado.

---

### PROMESSA

O cliente informou que realizará o pagamento posteriormente.

Nesta versão o sistema ainda não registra a data da promessa.

Essa evolução será realizada futuramente.

---

# Regras

## RO-001

Todo cliente inicia como:

Resultado Operacional = PENDENTE

---

## RO-002

Registrar um atendimento altera apenas o Resultado Operacional.

Nenhuma informação financeira poderá ser modificada automaticamente.

---

## RO-003

Pagamento continua sendo registrado exclusivamente pelo fluxo de Pagamentos.

Registrar um atendimento nunca poderá quitar parcelas.

---

## RO-004

Resultado Operacional representa apenas o último atendimento realizado.

Nesta versão não haverá histórico.

---

# Fluxo Operacional

```text
Cobrança

↓

Atendimento

↓

Resultado Operacional

↓

Central de Operações atualizada
```

---

# Fluxo Futuro

Esta modelagem permitirá evoluir posteriormente para:

```text
Cliente

↓

Histórico de Atendimentos

↓

Atendimento

↓

Canal

↓

Resultado

↓

Próxima ação
```

Sem necessidade de alterar o conceito definido neste documento.

---

# Impacto na Central de Operações

## Dashboard

O Dashboard continuará utilizando:

- situação financeira;
- indicadores do dia.

O Resultado Operacional será utilizado apenas para indicar a situação da cobrança.

---

## Rota

A Rota continuará priorizando clientes sem atendimento.

Clientes já atendidos poderão ser deslocados para o final da sequência, independentemente do resultado financeiro.

Essa regra será detalhada em um plano específico.

---

## Lista de Cobranças

Cada item deverá exibir:

- situação financeira;
- resultado operacional.

Essas informações deverão permanecer independentes.

Exemplo:

🔴 Atrasado

🟡 Promessa

ou

🔴 Atrasado

⚪ Não encontrado

---

# Fora do Escopo

Esta entrega não implementa:

- histórico de atendimentos;
- data da promessa;
- observações;
- reagendamento;
- inteligência operacional;
- métricas de atendimento;
- ordenação das listas (será tratada em plano específico — Fase 2 do Roadmap).

Esses temas serão tratados em planos futuros.

> **Nota:** Embora a ordenação seja conceitualmente fora do escopo, a migração do campo `visitadoEm` para `resultadoOperacional` exige atualizar as referências de ordenação existentes para manter o comportamento atual (PENDENTE primeiro, depois os demais). Isso é feito sem alterar a lógica de ordenação.

---

## Tabela de Comportamento

| Resultado | Atendimento concluído | Continua visível | Vai para o fim da rota |
|-----------|----------------------|------------------|------------------------|
| PENDENTE | Não | Sim | Não |
| VISITADO | Sim | Sim | Sim |
| NAO_ENCONTRADO | Sim | Sim | Sim |
| PROMESSA | Sim | Sim | Sim |

---

# Critérios de Aceitação

- Existe definição oficial para Atendimento.
- Existe definição oficial para Resultado Operacional.
- Todas as telas passam a utilizar a mesma nomenclatura.
- O conceito fica desacoplado das regras financeiras.
- A documentação passa a servir como referência para futuras implementações.

---

# Roadmap

## Fase 1

- Definir Atendimento.
- Definir Resultado Operacional.
- Padronizar nomenclatura.

---

## Fase 2

- Padronizar ordenação das listas.
- Atualizar Dashboard.
- Atualizar Rota.

---

## Fase 3

Adicionar:

- Histórico de Atendimentos;
- Canal do atendimento;
- Observações;
- Data da promessa;
- Próxima ação;
- Inteligência operacional.

---

# Princípio

O sistema deverá responder duas perguntas diferentes.

Financeiro:

> "Como está a cobrança?"

Operacional:

> "Qual foi o último atendimento realizado?"

Esses conceitos deverão permanecer independentes durante toda a evolução do sistema.

---

# Implementação — Fase 1

## Ordem de execução (zero retrabalho)

```
P0  →  P1  →  P2  →  P3+P4+P5+P6  →  P7  →  P8
```

P0 e P1 são independentes (podem começar juntos). P2 depende de P1. P3..P6 são consumidores de P2 e podem ser feitos em lote. P7 e P8 ficam para o final.

---

## P0 — Event Bus

**Arquivo:** `frontend/src/shared/events/eventBus.ts` (novo)

**O que fazer:**

Criar Event Bus simples para substituir `window.dispatchEvent`:

```ts
type Listener = (...args: unknown[]) => void

class EventBus {
  private listeners = new Map<string, Set<Listener>>()

  on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(fn)
    return () => this.listeners.get(event)?.delete(fn)
  }

  emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach((fn) => fn(...args))
  }
}

export const eventBus = new EventBus()
```

---

## P1 — Backend: resultadoOperacional na query

**Arquivo:** `src/modules/operacoes/infrastructure/repositories/operacoes.repository.impl.ts`

**O que fazer:**

1. Alterar a subquery `LEFT JOIN v` para retornar também o `tipo` do último registro:

```sql
LEFT JOIN (
  SELECT clienteId, contratoId,
    MAX(createdAt) AS visitadoEm,
    (SELECT h2.tipo FROM historico_operacional h2
     WHERE h2.clienteId = h.clienteId
       AND h2.contratoId = h.contratoId
       AND date(h2.createdAt) = ?
     ORDER BY h2.createdAt DESC LIMIT 1) AS resultadoOperacional
  FROM historico_operacional h
  WHERE date(h.createdAt) = ?
  GROUP BY clienteId, contratoId
) v ON v.clienteId = c.id AND v.contratoId = ct.id
```

2. Adicionar `resultadoOperacional: string | null` na interface `CobrancaRow`
3. Mapear no `.map()`: `resultadoOperacional: (r.resultadoOperacional ?? "PENDENTE") as CobrancaItem["resultadoOperacional"]`
4. Atualizar sort: `a.visitadoEm && !b.visitadoEm` → `a.resultadoOperacional === "PENDENTE" && b.resultadoOperacional !== "PENDENTE"`

---

## P2 — Frontend: tipo + constantes

**Arquivo:** `frontend/src/modules/operacoes/services/operacoes.service.ts`

**O que fazer:**

1. Adicionar constantes:
```ts
export const ResultadoOperacional = {
  PENDENTE: "PENDENTE",
  VISITADO: "VISITADO",
  NAO_ENCONTRADO: "NAO_ENCONTRADO",
  PROMESSA: "PROMESSA",
} as const

export type ResultadoOperacionalType = (typeof ResultadoOperacional)[keyof typeof ResultadoOperacional]
```

2. Adicionar ao `CobrancaItem`:
```ts
resultadoOperacional: ResultadoOperacionalType
```

3. Manter `visitadoEm?: string | null` temporariamente para compatibilidade

---

## P3 — CobrancaCard: badge por resultado

**Arquivo:** `frontend/src/modules/operacoes/components/CobrancaCard.tsx`

**O que fazer:**

1. Trocar prop `visitadoEm?: string | null` por `resultadoOperacional: string` (default `ResultadoOperacional.PENDENTE`)
2. Badge condicional:
```tsx
{resultadoOperacional !== ResultadoOperacional.PENDENTE && (
  <Card.Badge
    variant={
      resultadoOperacional === ResultadoOperacional.VISITADO ? "neutral" :
      resultadoOperacional === ResultadoOperacional.NAO_ENCONTRADO ? "warning" :
      "info"
    }
    label={t(`operacoes.resultado.${resultadoOperacional.toLowerCase()}`)}
  />
)}
```

---

## P4 — RotaPage: QuickActions condicionais

**Arquivo:** `frontend/src/modules/operacoes/pages/RotaPage.tsx`

**O que fazer:**

1. Adicionar `show` nas QuickActions:
```tsx
{ icon: UserCheck, label: t("operacoes.visitado"), onClick: () => handleVisitado(slideItem), variant: "gray",
  show: slideItem.resultadoOperacional !== ResultadoOperacional.VISITADO },
{ icon: MapPinOff, label: t("operacoes.naoEncontrado"), onClick: () => handleNaoEncontrado(slideItem), variant: "gray",
  show: slideItem.resultadoOperacional !== ResultadoOperacional.NAO_ENCONTRADO },
{ icon: CalendarClock, label: t("operacoes.promessa"), onClick: handleAbrirPromessa, variant: "warning",
  show: slideItem.resultadoOperacional !== ResultadoOperacional.PROMESSA },
```

2. Atualizar `handleVisitado`, `handleNaoEncontrado`, `handleConfirmarPromessa`:
   - `findIndex(c => !c.visitadoEm)` → `findIndex(c => c.resultadoOperacional === ResultadoOperacional.PENDENTE)`

---

## P5 — Sort/filter usar resultadoOperacional

**Arquivos:** `RotaPage.tsx`, `CobrancaListPage.tsx`, `CobrancaList.tsx`

**O que fazer:**

Busca/substitui nos 3 arquivos:
- `!i.visitadoEm` → `i.resultadoOperacional === ResultadoOperacional.PENDENTE`
- `i.visitadoEm` → `i.resultadoOperacional !== ResultadoOperacional.PENDENTE`

---

## P6 — i18n: chaves dos resultados

**Arquivos:** `frontend/src/i18n/locales/{pt-BR,en,es}.json`

Adicionar em cada locale:
```json
"operacoes": {
  "resultado": {
    "pendente": "Pendente",
    "visitado": "Visitado",
    "naoEncontrado": "Não Encontrado",
    "promessa": "Promessa"
  }
}
```

---

## P7 — Dashboard: ordenação consistente

**Arquivo:** `frontend/src/modules/operacoes/pages/OperacoesDashboard.tsx`

**O que fazer:**

Separar pendentes + resolvidos (igual RotaPage):
```ts
const pendentes = sortedCobrancas.filter(i => i.resultadoOperacional === ResultadoOperacional.PENDENTE)
const resolvidos = sortedCobrancas.filter(i => i.resultadoOperacional !== ResultadoOperacional.PENDENTE)
const itemsOrdenados = [...pendentes, ...resolvidos]
```

Usar `itemsOrdenados` no Carousel.

---

## P8 — Listas escutarem EventBus

**Arquivos:** `RotaPage.tsx`, `OperacoesDashboard.tsx`, `CobrancaListPage.tsx`

**O que fazer:**

1. Em `RotaPage.tsx`, após sucesso de `handleVisitado`, `handleNaoEncontrado`, `handleConfirmarPromessa`:
```ts
eventBus.emit("operacao:atualizada")
```

2. Em `OperacoesDashboard.tsx` e `CobrancaListPage.tsx`:
```ts
useEffect(() => eventBus.on("operacao:atualizada", fetch), [fetch])
```

---

## Resumo

| # | Entrega | Arquivos | Complexidade |
|---|---------|----------|--------------|
| P0 | Event Bus | 1 novo | 🟢 Baixa |
| P1 | Backend: resultadoOperacional | 1 alt | 🟡 Média |
| P2 | Frontend: tipo + constantes | 1 alt | 🟢 Baixa |
| P3 | CobrancaCard: badge por resultado | 1 alt | 🟢 Baixa |
| P4 | RotaPage: QuickActions condicionais | 1 alt | 🟢 Baixa |
| P5 | Sort/filter usar resultadoOperacional | 3 alt | 🟢 Baixa |
| P6 | i18n: chaves dos resultados | 3 alt | 🟢 Baixa |
| P7 | Dashboard: ordenação consistente | 1 alt | 🟢 Baixa |
| P8 | Listas escutarem EventBus | 3 alt | 🟢 Baixa |

---

# PLAN-009 — Sugestões de Refinamento

**Status:** Proposta

**Objetivo**

Registrar melhorias arquiteturais identificadas durante a revisão do PLAN-009.

Estas sugestões **não fazem parte da implementação atual** e deverão ser avaliadas individualmente conforme a evolução do sistema.

---

# 1. Renomear `resultadoOperacional`

## Situação atual

O plano utiliza o campo:

```ts
resultadoOperacional
```

Embora seja descritivo, o nome é relativamente longo e será utilizado em diversos arquivos do frontend e backend.

Exemplo:

```ts
item.resultadoOperacional
```

---

## Sugestão

Renomear para:

```ts
ultimoResultado
```

ou

```ts
resultadoAtendimento
```

Exemplo:

```ts
item.ultimoResultado
```

O objetivo é reduzir repetição sem perder significado.

---

# 2. Evitar Strings espalhadas

## Situação atual

Comparações previstas:

```ts
"PENDENTE"

"VISITADO"

"PROMESSA"

"NAO_ENCONTRADO"
```

---

## Sugestão

Criar um arquivo compartilhado.

Exemplo:

```ts
export const ResultadoAtendimento = {
  PENDENTE: "PENDENTE",
  VISITADO: "VISITADO",
  PROMESSA: "PROMESSA",
  NAO_ENCONTRADO: "NAO_ENCONTRADO",
} as const;
```

Uso:

```ts
if (item.ultimoResultado === ResultadoAtendimento.PROMESSA)
```

Benefícios:

- evita erros de digitação;
- facilita refatorações;
- centraliza os estados oficiais.

---

# 3. Criar Event Bus simples

## Situação atual

O plano utiliza:

```ts
window.dispatchEvent(...)
```

para sincronizar Dashboard, Rota e Lista.

---

## Sugestão

Criar um Event Bus compartilhado.

Estrutura sugerida:

```
shared/
    events/
        eventBus.ts
        events.ts
```

Exemplo:

```ts
eventBus.emit("operacao:atualizada")
```

```ts
eventBus.on("operacao:atualizada", reload)
```

Objetivos:

- eliminar eventos globais espalhados;
- facilitar manutenção futura;
- manter baixo acoplamento entre módulos.

---

# 4. Documentar oficialmente os estados

Adicionar uma tabela oficial de comportamento.

| Resultado | Atendimento concluído | Continua visível | Vai para o fim da rota |
|------------|----------------------|------------------|------------------------|
| PENDENTE | Não | Sim | Não |
| VISITADO | Sim | Sim | Sim |
| NAO_ENCONTRADO | Sim | Sim | Sim |
| PROMESSA | Sim | Sim | Sim |

Essa tabela passa a ser a referência oficial para futuras implementações.

---

# 5. Separar Resultado de Atendimento e Estado Operacional

Hoje o sistema utiliza um único conceito.

No futuro pode existir uma distinção entre:

## Resultado do atendimento

Representa o que aconteceu na visita.

Exemplo:

- PENDENTE
- VISITADO
- PROMESSA
- NAO_ENCONTRADO

---

## Estado operacional

Representa se aquele cliente ainda exige ação do operador.

Exemplo:

```ts
requiresAction = ultimoResultado === ResultadoAtendimento.PENDENTE
```

ou

```ts
statusOperacional:

PENDENTE

CONCLUIDO
```

A UI pode utilizar apenas o estado operacional para:

- ordenação;
- filtros;
- Dashboard;
- Rota.

Enquanto o histórico continua preservando o resultado real do atendimento.

---

# Observação

Estas melhorias possuem caráter arquitetural.

Elas não bloqueiam a implementação do PLAN-009 e poderão ser incorporadas em uma futura revisão caso tragam benefícios claros ao projeto.