# SKILL-001 — Documentation Reviewer

**Status:** Aprovada

**Versão:** 1.0

---

# Objetivo

Revisar a documentação do projeto garantindo consistência, ausência de contradições e alinhamento arquitetural.

Esta Skill nunca implementa código.

Sua responsabilidade é exclusivamente analisar e revisar a documentação.

---

# Entradas

Pode receber:

- um documento específico;
- vários documentos;
- uma proposta de alteração;
- uma nova funcionalidade.

---

# Processo

A revisão deverá seguir obrigatoriamente a sequência abaixo.

## 1. Compreensão

Ler integralmente o(s) documento(s).

Compreender seu objetivo antes de sugerir alterações.

---

## 2. Contexto

Identificar quais documentos oficiais possuem relação direta com o documento analisado.

Exemplos:

- NORTH-STAR
- PROJECT
- DOMAIN
- BUSINESS-RULES
- ARCHITECTURE
- DATABASE
- BACKEND
- FRONTEND
- API
- ADRs

---

## 3. Consistência

Verificar:

- contradições;
- duplicação de responsabilidades;
- referências incorretas;
- nomenclaturas inconsistentes;
- conflitos entre documentos.

---

## 4. Arquitetura

Validar se o documento respeita:

- ADRs;
- princípios arquiteturais;
- responsabilidades das camadas;
- separação de responsabilidades.

Nenhuma sugestão poderá contrariar uma decisão arquitetural aprovada.

---

## 5. Clareza

Verificar:

- linguagem objetiva;
- ausência de ambiguidades;
- organização lógica;
- facilidade de leitura.

---

## 6. Evolução

Avaliar se o documento permite evolução futura sem necessidade de reestruturação significativa.

---

## 7. Boas Práticas

Verificar aderência a:

- simplicidade;
- alta coesão;
- baixo acoplamento;
- responsabilidade única;
- facilidade de manutenção.

---

## 8. Sugestões

Apresentar apenas melhorias que possuam benefício técnico claro.

Evitar sugestões baseadas apenas em preferência de escrita.

Cada sugestão deverá conter:

- motivo;
- impacto;
- prioridade.

---

# Restrições

Nunca alterar escopo do documento.

Nunca criar abstrações desnecessárias.

Nunca mover responsabilidades entre documentos sem justificativa.

Nunca sugerir tecnologias que contrariem os ADRs.

---

# Saída

Ao finalizar a revisão deverá apresentar:

## O que está correto

Lista dos pontos aprovados.

---

## Melhorias

Lista priorizada das melhorias sugeridas.

---

## Consistência

Informar se existe conflito com outros documentos.

---

## Status

Um dos seguintes:

- Aprovado
- Aprovado com ajustes
- Requer revisão