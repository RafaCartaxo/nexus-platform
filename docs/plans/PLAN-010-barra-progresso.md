# PLAN-010 — Fila Operacional de Cobrança

**Status:** Em andamento

**Versão:** 2.0

**Dependências:**
- PLAN-008 — Carrossel de Navegação
- PLAN-009 — Conceito de Atendimento

---

# Objetivo

Transformar a Rota de Cobrança e a lista Cobranças do Dia em filas operacionais,
exibindo exclusivamente clientes pendentes. Qualquer atendimento registrado remove
imediatamente o cliente da fila, preservando o histórico para a futura tela Atendidos Hoje.

---

# Problema

Hoje o carrossel utiliza um indicador clássico de paginação.

Exemplo:

```
● ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○
```

Esse padrão funciona para poucas páginas, porém apresenta problemas quando aplicado a uma lista operacional:

- ocupa espaço desnecessário;
- perde legibilidade com muitos clientes;
- não comunica produtividade;
- não informa quantos atendimentos já foram realizados;
- não ajuda o operador a entender quanto trabalho ainda resta.

O operador precisa saber o andamento da rota, não a quantidade de páginas.

---

# Objetivo da melhoria

A área inferior do card deverá apresentar informações operacionais da rota.

Exemplo:

```
Cliente 6 de 22

████████████░░░░░░░░

✓ 8 atendidos • 14 pendentes
```

A interface passa a responder duas perguntas:

- Onde estou na rota?
- Quanto trabalho ainda falta?

---

# Conceito

A barra representa o progresso operacional da rota.

Ela não representa:

- pagamentos;
- valores recebidos;
- resultado financeiro.

Ela representa exclusivamente os atendimentos realizados durante o dia.

---

# Conceitos Utilizados

## Cliente Atual

Representa a posição atual dentro do carrossel.

Exemplo:

```
Cliente 6 de 22
```

Não possui relação direta com produtividade.

Serve apenas para localização durante a navegação.

---

## Atendimento Realizado

Considera-se um atendimento realizado quando existe um resultado operacional registrado para aquele cliente na data atual.

São considerados atendimentos realizados:

- Visitado
- Não Encontrado
- Promessa de Pagamento

Todos removem o cliente da fila principal da rota.

---

## Atendimento Pendente

Permanece pendente quando nenhum resultado operacional foi registrado para aquele cliente no dia.

Enquanto permanecer pendente:

- continua na fila principal;
- permanece contabilizado como pendente;
- continua exigindo ação do operador.

---

# Layout

A área inferior do carrossel deverá possuir a seguinte estrutura:

```
Cliente 6 de 22

████████████░░░░░░░░

✓ 8 atendidos • 14 pendentes
```

Não deverá existir paginação por bolinhas.

---

# Informações Exibidas

A barra deverá apresentar:

## Cliente Atual

```
Cliente 6 de 22
```

---

## Barra de Progresso

Representando:

```
atendidos / total
```

Exemplo:

```
████████████░░░░░░░░
```

---

## Resumo

Exemplo:

```
✓ 8 atendidos • 14 pendentes
```

---

# Cálculo

## Total

Quantidade total de clientes da rota.

```
total = rota.length
```

---

## Atendidos

Clientes cujo:

```
resultadoOperacional != PENDENTE
```

---

## Pendentes

Clientes cujo:

```
resultadoOperacional == PENDENTE
```

---

## Percentual

```
(atendidos / total) × 100
```

---

# Atualização

A barra deverá atualizar automaticamente quando o operador registrar:

- Visitado;
- Não Encontrado;
- Promessa de Pagamento.

Não deverá ser necessário atualizar a página.

---

# Fluxo

```
Operador registra atendimento

↓

resultadoOperacional atualizado

↓

Cliente vai para o final da rota

↓

Barra recalcula

↓

Resumo atualizado
```

---

# Implementação — Fila Operacional

## Ordem

```
P1 → P2 → P3 → P4
```

---

## P1 — Atualizar comportamento da Rota de Cobrança

**Arquivos:** `RotaPage.tsx`

**O que fazer:**

1. `sortedItems` = apenas `pendentes` (clientes com `resultadoOperacional === PENDENTE`)
2. `routeTotal` / `routeCompleted` / `routePending` derivados do array `items` completo (não do filtrado)

**Comportamento:** Após registrar qualquer resultado operacional, o cliente sai da fila e o próximo pendente entra automaticamente no mesmo índice.

---

## P2 — Atualizar comportamento da lista Cobranças do Dia

**Arquivos:** `CobrancaListPage.tsx`, `CobrancaList.tsx`

**O que fazer:**

1. Remover filtros [Todos/Pendentes/Visitados] da `CobrancaListPage`
2. Filtrar sempre apenas PENDENTE antes de passar à `CobrancaList`
3. Remover split `naoVisitados` / `visitados` da `CobrancaList` — lista plana

---

## P3 — Atualizar Dashboard para exibir apenas pendências

**Arquivos:** `OperacoesDashboard.tsx`

**O que fazer:**

1. `itemsOrdenados` = apenas `pendentes` (remover `resolvidos`)

---

## P4 — Documentação

**Arquivos:** `PLAN-010`, `04-ROADMAP.md`, `CHECKLIST-FASE9.md`

**O que fazer:**

1. Atualizar PLAN-010 com escopo atual
2. Atualizar ROADMAP §1.15
3. Atualizar CHECKLIST-FASE9

---

# Critérios de Aceitação

- Rota exibe apenas clientes pendentes.
- Cobranças do Dia exibe apenas clientes pendentes.
- Dashboard exibe apenas clientes pendentes.
- Após qualquer resultado operacional, cliente sai imediatamente da fila.
- Cliente pago sai naturalmente pelas regras financeiras (sem alteração).
- O histórico fica reservado para o PLAN-011 — Atendidos Hoje.

---

# Fora do Escopo

Esta implementação não inclui:

- criação de badges ou componentes visuais (pertencem ao PLAN-009);
- Pagamento como resultado operacional (pertence ao domínio financeiro);
- tela Atendidos Hoje;
- histórico operacional;
- filtros por resultado;
- relatórios.

---

# Evolução Futura

## PLAN-011 — Atendidos Hoje

Todos os clientes removidos da fila serão apresentados na futura tela:

- listar todos os atendimentos do dia;
- mostrar o resultado operacional;
- permitir novo contato (WhatsApp, ligação);
- abrir contrato;
- visualizar histórico operacional.

---

Revisar e atualizar o PLAN-010 conforme as seguintes decisões arquiteturais.

O objetivo do plano NÃO é criar novas funcionalidades, mas transformar a Rota de Cobrança e a lista "Cobranças do Dia" em verdadeiras filas operacionais.

## Decisões

### 1. Pagamento NÃO é Resultado Operacional

Remover qualquer referência a "Pagamento" como resultado operacional.

Pagamento pertence exclusivamente ao domínio financeiro.

O cliente pago sai naturalmente da fila porque deixa de possuir saldo pendente, conforme a regra financeira já existente.

Resultados Operacionais passam a ser apenas:

- VISITADO
- PROMESSA
- NÃO_ENCONTRADO

Esses resultados representam apenas o encerramento do atendimento operacional.

---

### 2. O PLAN-010 trata apenas comportamento

Remover qualquer implementação que pertença ao PLAN-009, como:

- criação de badges;
- padronização visual;
- componentes compartilhados;
- ResultBadge;
- ajustes de Design System.

Esses itens já pertencem ao plano anterior.

O PLAN-010 deve alterar apenas o comportamento das listas operacionais.

---

### 3. Conceito de Fila Operacional

A Rota de Cobrança e a lista "Cobranças do Dia" representam exclusivamente trabalho pendente.

Enquanto o cliente não receber atendimento, permanece na fila.

Após registrar qualquer Resultado Operacional:

- VISITADO
- PROMESSA
- NÃO_ENCONTRADO

o cliente deve sair imediatamente da fila.

Não deve ir para o final da lista.

Não deve permanecer visível.

O próximo cliente passa automaticamente a ser o foco.

---

### 4. Dashboard

O Dashboard também deve seguir esse conceito.

A lista "Cobranças do Dia" deve exibir somente clientes pendentes.

Clientes já atendidos não devem aparecer novamente.

O Dashboard deve continuar respondendo apenas uma pergunta:

> Quem ainda preciso atender hoje?

---

### 5. PLAN-011

Adicionar uma observação ao final do documento informando que todos os clientes removidos da fila serão apresentados futuramente na tela:

PLAN-011 — Atendidos Hoje

Essa tela será responsável por:

- listar todos os atendimentos do dia;
- mostrar o resultado operacional;
- permitir novo contato (WhatsApp, ligação);
- abrir contrato;
- visualizar histórico operacional.

O PLAN-010 apenas prepara essa evolução.

---

### 6. Atualizar objetivo do plano

Substituir o objetivo atual por um objetivo mais claro.

Sugestão:

"Transformar a Rota de Cobrança e a lista Cobranças do Dia em filas operacionais, exibindo exclusivamente clientes pendentes. Qualquer atendimento registrado remove imediatamente o cliente da fila, preservando o histórico para a futura tela Atendidos Hoje."

---

### 7. Enxugar as etapas de implementação

O plano deve conter apenas as entregas necessárias para a mudança de comportamento.

Sugestão:

P1 — Atualizar comportamento da Rota de Cobrança.

P2 — Atualizar comportamento da lista Cobranças do Dia.

P3 — Atualizar Dashboard para exibir apenas pendências.

P4 — Atualizar documentação e preparar integração com o PLAN-011.

Não incluir criação de componentes, badges ou Design System.

---

### 8. Atualizar documentação

Atualizar:

- PLAN-010
- ROADMAP
- CHECKLIST da fase correspondente

Sem criar novos componentes ou alterar o escopo do PLAN-009.

---

## Objetivo Final

Ao final desta implementação:

- A Rota de Cobrança exibirá apenas clientes pendentes.
- A lista Cobranças do Dia exibirá apenas clientes pendentes.
- Qualquer atendimento operacional removerá imediatamente o cliente da fila.
- Clientes pagos continuarão saindo da fila automaticamente pelas regras financeiras existentes.
- O Dashboard permanecerá focado apenas no trabalho restante do dia.
- O histórico dos clientes atendidos ficará reservado para o futuro PLAN-011 — Atendidos Hoje.