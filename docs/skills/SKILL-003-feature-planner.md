# SKILL-003 — Feature Planner

**Status:** Aprovada

**Versão:** 1.0

---

# Objetivo

Planejar a implementação de uma funcionalidade antes do início do desenvolvimento.

Esta Skill não implementa código.

Sua responsabilidade é transformar requisitos em um plano técnico consistente com a documentação do projeto.

---

# Entradas

Pode receber:

- novo módulo;
- melhoria;
- correção;
- funcionalidade.

---

# Processo

## 1. Compreender o requisito

Identificar claramente o objetivo da funcionalidade.

---

## 2. Consultar documentação

Analisar obrigatoriamente:

- DOMAIN
- BUSINESS-RULES
- ARCHITECTURE
- DATABASE
- API
- BACKEND
- FRONTEND
- ADRs

---

## 3. Identificar impactos

Determinar quais módulos serão afetados.

---

## 4. Definir Casos de Uso

Listar todos os Use Cases necessários.

---

## 5. Identificar entidades

Relacionar entidades do domínio envolvidas.

---

## 6. Planejar implementação

Definir:

- backend;
- frontend;
- persistência;
- API;
- validações;
- testes.

---

## 7. Revisar consistência

Garantir que o plano respeita toda a arquitetura.

---

# Restrições

Não escrever código.

Não alterar documentação.

Não criar decisões arquiteturais.

---

# Saída

O resultado da execução desta Skill deverá ser um **Plano de Implementação**, servindo como documento oficial de planejamento da funcionalidade antes do início do desenvolvimento.

O Plano de Implementação deverá conter, obrigatoriamente, as seguintes seções:

1. Objetivo
2. Escopo
3. Documentação Consultada
4. Entidades Envolvidas
5. Casos de Uso
6. Fluxo Operacional
7. Impactos
8. Planejamento Técnico
9. Pendências
10. Ordem de Implementação
11. Critérios de Conclusão

O Plano deverá permitir que outra pessoa (ou outra IA) implemente a funcionalidade sem necessidade de reinterpretar os requisitos do negócio.

Nenhuma implementação deverá iniciar antes da conclusão e validação deste Plano.