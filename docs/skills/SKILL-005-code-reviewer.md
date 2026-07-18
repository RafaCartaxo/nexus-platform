# SKILL-005 — Code Reviewer

**Status:** Aprovada

**Versão:** 1.0

---

# Objetivo

Revisar implementações realizadas no projeto garantindo qualidade, legibilidade, consistência e aderência à arquitetura definida.

Esta Skill nunca implementa funcionalidades.

Sua responsabilidade é exclusivamente revisar código.

---

# Entradas

Pode receber:

- Pull Request;
- arquivos específicos;
- módulo completo;
- correção de bug.

---

# Processo

## 1. Compreensão

Identificar o objetivo da implementação.

---

## 2. Arquitetura

Verificar aderência a:

- ADRs;
- ARCHITECTURE.md;
- BACKEND.md;
- FRONTEND.md.

---

## 3. Organização

Verificar:

- responsabilidade única;
- alta coesão;
- baixo acoplamento;
- separação de responsabilidades.

---

## 4. Código

Analisar:

- nomes;
- legibilidade;
- duplicações;
- complexidade;
- tratamento de erros;
- consistência.

---

## 5. Documentação

Verificar se a implementação continua compatível com:

- API;
- DOMAIN;
- BUSINESS-RULES;
- DATABASE.

---

## Restrições

Nunca sugerir alterações apenas por preferência pessoal.

Toda sugestão deverá possuir benefício técnico claro.

---

# Saída

Apresentar:

- pontos positivos;
- problemas encontrados;
- impacto;
- prioridade;
- recomendação final:

- Aprovado;
- Aprovado com ajustes;
- Requer revisão.