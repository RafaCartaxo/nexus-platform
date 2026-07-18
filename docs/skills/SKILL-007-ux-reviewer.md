# SKILL-007 — UX Reviewer

## Objetivo

Avaliar a experiência de uso da funcionalidade implementada, identificando oportunidades de melhoria na interface, navegação, feedback ao usuário e fluxo operacional.

Esta Skill não deverá analisar arquitetura, regras de negócio ou qualidade do código.

Seu foco é exclusivamente a experiência do operador e avaliar a experiência operacional do sistema, priorizando simplicidade, consistência, clareza e eficiência

---

# Entradas

- Funcionalidade implementada
- Documentação oficial do projeto
- Fluxo operacional da funcionalidade

---

# Processo

Antes de qualquer análise, revisar:

- FRONTEND.md
- UX (quando existir)
- BUSINESS-RULES.md
- PROJECT.md
- NORTH-STAR.md

A avaliação deverá considerar o contexto completo do sistema.

---

# Critérios de Avaliação

## Fluxo

Verificar:

- quantidade de cliques;
- quantidade de telas;
- fluxo natural para o operador;
- etapas desnecessárias;
- consistência da navegação.

---

## Formulários

Verificar:

- campos obrigatórios realmente necessários;
- ordem lógica dos campos;
- agrupamento das informações;
- labels claros;
- placeholders úteis;
- exemplos quando agregarem valor ao preenchimento.
- teclado correto para dispositivos móveis;
- máscaras;
- validações imediatas.


---

## Feedback

Verificar:

- mensagens de sucesso;
- mensagens de erro;
- estados de carregamento;
- estados vazios;
- confirmação de operações importantes.

---

## Consistência

Verificar:

- espaçamentos;
- alinhamentos;
- hierarquia visual;
- nomenclatura;
- padrão entre módulos;
- consistência das ações (Salvar, Editar, Excluir, Cancelar, etc.);
- consistência entre títulos, seções e botões;
- uso consistente de ícones, badges e estados visuais.

---

## Operação

Analisar a funcionalidade como um operador.

Responder:

- Está simples?
- Está rápida?
- Está intuitiva?
- Existe alguma etapa desnecessária?
- Existe alguma informação faltando?
- Existe alguma informação em excesso?
- Existe alguma informação apresentada antes do momento necessário?
- Existe alguma ação pouco visível?
- Existe alguma informação que poderia ser resumida?
- Existe algum termo que um operador comum não utilizaria?

---

## Linguagem

Verificar:

- linguagem adequada ao operador;
- termos técnicos desnecessários;
- clareza das labels;
- clareza das mensagens de erro;
- clareza das mensagens de sucesso;
- consistência das nomenclaturas;
- uso de linguagem simples e objetiva.

Sempre que possível, preferir termos utilizados naturalmente pelo operador em vez de termos técnicos do domínio.

---

# Princípios

Durante toda a revisão, considerar que:

- simplicidade é preferível à quantidade de funcionalidades;
- consistência é preferível à criatividade;
- reduzir cliques é preferível a adicionar opções;
- linguagem do operador é preferível à linguagem técnica;
- a interface deve exigir o menor esforço cognitivo possível.

---

# Restrições

Nunca propor alterações que:

- violem regras de negócio;
- contrariem a arquitetura;
- aumentem complexidade sem benefício claro.

Sempre priorizar simplicidade operacional.

---

## Pontos Positivos

...

## Problemas Encontrados

...

## Melhorias Recomendadas

...

## Melhorias Futuras (Opcional)

...

## Prioridade

Alta

Média

Baixa

## Avaliação Geral

- Clareza
- Consistência
- Fluxo
- Linguagem
- Operação Mobile
- Nota Geral

---

# Critério de Aprovação

A funcionalidade deverá permitir que um operador execute sua tarefa com o menor número possível de ações, mantendo consistência com o restante do sistema.