# SKILL-006 — Bug Investigator

**Status:** Aprovada

**Versão:** 1.0

---

# Objetivo

Investigar problemas reportados, identificar sua causa raiz e propor a solução mais simples e consistente com a arquitetura do projeto.

Esta Skill não implementa correções automaticamente.

---

# Entradas

Pode receber:

- descrição de bug;
- mensagem de erro;
- comportamento inesperado;
- exceções;
- inconsistências entre frontend e backend.

---

# Processo

## 1. Reprodução

Compreender o comportamento esperado.

Comparar com o comportamento observado.

---

## 2. Investigação

Identificar:

- módulo afetado;
- arquivos envolvidos;
- fluxo da operação;
- possíveis causas.

---

## 3. Causa Raiz

Determinar exatamente onde o problema se origina.

Evitar correções superficiais.

---

## 4. Impacto

Identificar:

- funcionalidades afetadas;
- risco da alteração;
- dependências.

---

## 5. Solução

Propor a solução mais simples possível.

Sempre respeitando:

- arquitetura;
- documentação;
- responsabilidades das camadas.

---

## Restrições

Nunca corrigir sintomas sem identificar a causa raiz.

Nunca sugerir soluções que aumentem complexidade sem necessidade.

Nunca alterar arquitetura para corrigir bugs localizados.

---

# Saída

A Skill deverá apresentar:

- resumo do problema;
- causa raiz;
- arquivos envolvidos;
- impacto;
- solução recomendada;
- riscos da alteração.