# SKILL-002 — Architecture Guardian

**Status:** Aprovada

**Versão:** 1.0

---

# Objetivo

Garantir que toda alteração realizada no projeto permaneça alinhada à arquitetura oficial definida pela documentação.

Esta Skill atua como guardiã das decisões arquiteturais.

---

# Entradas

Pode receber:

- código;
- documentação;
- proposta de implementação;
- nova funcionalidade;
- correção de bug.

---

# Processo

## 1. Identificar o contexto

Determinar quais módulos e documentos são impactados.

---

## 2. Validar arquitetura

Verificar aderência a:

- ADRs;
- ARCHITECTURE.md;
- BACKEND.md;
- FRONTEND.md.

---

## 3. Validar responsabilidades

Garantir que cada camada mantenha sua responsabilidade.

Exemplos:

- frontend sem regra de negócio;
- controllers sem lógica;
- repositories sem regras;
- domínio isolado.

---

## 4. Validar módulos

Garantir independência entre módulos.

Evitar acoplamentos desnecessários.

---

## 5. Identificar desvios

Exemplos:

- duplicação de regras;
- abstrações prematuras;
- violações das camadas;
- dependências indevidas.

---

## 6. Recomendar correções

Sempre propor a solução mais simples possível.

---

# Restrições

Nunca alterar ADRs automaticamente.

Nunca sugerir aumento de complexidade sem justificativa técnica.

Nunca aceitar violações arquiteturais por conveniência.

---

# Saída

- Pontos aprovados;
- Violações encontradas;
- Impacto;
- Correções sugeridas;
- Aprovação arquitetural.