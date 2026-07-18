# PLAN-012 — Resumo Operacional da Rota

**Status:** Planejado

**Versão:** 1.0

**Dependências:**
- PLAN-009 — Conceito de Atendimento
- PLAN-010 — Barra de Progresso da Rota

---

# Objetivo

Evoluir a barra de progresso da Rota de Cobrança adicionando um resumo dos resultados operacionais do dia.

O objetivo é permitir que o operador acompanhe rapidamente o andamento da operação sem precisar acessar outras telas, mantendo a interface simples, objetiva e focada na execução.

Esta implementação não altera regras de negócio nem o comportamento da rota, apenas amplia as informações exibidas.

---

# Problema

Atualmente a barra de progresso informa apenas:

- progresso da rota;
- quantidade de clientes pendentes.

Embora suficiente para indicar o andamento da rota, ela não permite entender rapidamente como os atendimentos estão sendo concluídos ao longo do dia.

O operador precisa responder perguntas como:

- Quantos clientes já visitei?
- Quantas promessas consegui?
- Quantos clientes não encontrei?
- Quantos clientes já efetuaram pagamento?

Sem precisar navegar para outra tela.

---

# Objetivo da Melhoria

Manter a barra de progresso atual e adicionar um resumo operacional logo abaixo.

Layout proposto:

```text
██████████████░░░░░░░░

12 Pendentes

✓ Visitados..............6
🟡 Promessas.............2
⚪ Não encontrados........1
💰 Pagos.................5
```

O componente passa a responder duas perguntas:

- Quanto trabalho ainda falta?
- Como estão os resultados da operação de hoje?

---

# Conceitos

## Pendentes

Clientes que ainda não receberam atendimento operacional.

```
resultadoOperacional == PENDENTE
```

---

## Visitados

Clientes registrados como:

```
VISITADO
```

---

## Promessas

Clientes registrados como:

```
PROMESSA
```

---

## Não encontrados

Clientes registrados como:

```
NAO_ENCONTRADO
```

---

## Pagos

Quantidade de clientes que efetuaram pagamento durante o dia.

**Importante**

Pagamento **não é Resultado Operacional**.

Este indicador utiliza apenas as informações financeiras já existentes no sistema.

Nenhum novo registro deverá ser criado para suportar essa informação.

---

# Layout

```text
██████████████░░░░░░░░

12 Pendentes

✓ Visitados..............6
🟡 Promessas.............2
⚪ Não encontrados........1
💰 Pagos.................5
```

### Diretrizes

- manter layout compacto;
- priorizar leitura rápida;
- utilizar sempre a mesma ordem dos indicadores;
- todos os indicadores representam quantidade de clientes.

---

# Atualização

Os indicadores deverão ser atualizados automaticamente quando ocorrer:

- registro de visita;
- registro de promessa;
- registro de não encontrado;
- registro de pagamento.

Nenhum refresh manual deverá ser necessário.

---

# Implementação

## P1 — Evoluir RouteProgress

Atualizar o componente existente.

Adicionar as propriedades:

```ts
interface RouteProgressProps {
  total: number
  pending: number

  visitados: number
  promessas: number
  naoEncontrados: number

  pagos: number
}
```

---

## P2 — Calcular indicadores

Calcular automaticamente:

- pendentes;
- visitados;
- promessas;
- não encontrados;
- pagos.

Utilizar apenas os dados já carregados pela tela.

Não criar novas consultas.

---

## P3 — Atualizar interface

Adicionar abaixo da barra:

```text
12 Pendentes

✓ Visitados..............6
🟡 Promessas.............2
⚪ Não encontrados........1
💰 Pagos.................5
```

A barra de progresso permanece exatamente como já funciona hoje.

---

## P4 — Atualização automática

Sempre que houver alteração operacional ou financeira:

- recalcular indicadores;
- atualizar o componente;
- preservar o comportamento atual da rota.

---

# Critérios de Aceitação

- A barra de progresso continua funcionando normalmente.
- O resumo operacional é exibido abaixo da barra.
- O número de pendentes é atualizado automaticamente.
- O número de visitados é atualizado automaticamente.
- O número de promessas é atualizado automaticamente.
- O número de não encontrados é atualizado automaticamente.
- O número de pagos é atualizado automaticamente.
- Nenhum refresh manual é necessário.
- Nenhuma regra de negócio é alterada.

---

# Fora do Escopo

Esta implementação não altera:

- comportamento da rota;
- regras financeiras;
- Dashboard;
- histórico operacional;
- tela Atendidos Hoje;
- filtros ou relatórios.

---

# Evolução Futura

Esta implementação servirá como base para:

- PLAN-012 — Atendidos Hoje;
- indicadores de produtividade;
- métricas operacionais;
- histórico diário de atendimentos.

---

# Princípio de UX

A Rota de Cobrança deve responder imediatamente à pergunta:

> **"Quanto ainda falta e como está o resultado da minha operação hoje?"**

Toda informação exibida deve ser compreendida em poucos segundos, reduzindo esforço cognitivo e mantendo o operador focado na execução da cobrança.