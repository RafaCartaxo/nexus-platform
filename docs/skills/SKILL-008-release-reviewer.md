# SKILL-008 — Release Reviewer

## Objetivo

Validar se uma funcionalidade pode ser considerada concluída antes de ser integrada ao projeto.

Esta Skill representa a etapa final do processo de desenvolvimento.

Nenhuma funcionalidade deverá ser considerada pronta sem passar por esta revisão.

---

# Entradas

- Código implementado
- Documentação atualizada
- Plano de Implementação
- Funcionalidade em execução

---

# Processo

Antes da revisão, consultar obrigatoriamente:

- PROJECT.md
- NORTH-STAR.md
- ARCHITECTURE.md
- DOMAIN.md
- BUSINESS-RULES.md
- DATABASE.md
- API.md
- BACKEND.md
- FRONTEND.md
- CONVENTIONS.md
- ADRs
- Plano de Implementação correspondente

---

# Checklist

## Documentação

Verificar:

- documentação atualizada;
- regras refletidas corretamente;
- endpoints documentados;
- alterações arquiteturais registradas;
- referências consistentes.

---

## Arquitetura

Verificar:

- separação de responsabilidades;
- organização por módulos;
- uso correto das camadas;
- ausência de regras de negócio no frontend;
- ausência de lógica em Controllers e Repositories.

---

## Backend

Verificar:

- casos de uso completos;
- validações;
- tratamento de erros;
- persistência;
- integração entre módulos.

---

## Frontend

Verificar:

- integração com API;
- tratamento de estados;
- mensagens de erro;
- formulários;
- navegação;
- consistência visual.

---

## Qualidade

Verificar:

- código morto;
- TODOs esquecidos;
- console.log;
- comentários temporários;
- duplicação de código.

---

## Funcionalidade

Confirmar que todos os objetivos definidos no Plano de Implementação foram atendidos.

Verificar:

- casos de uso;
- fluxos operacionais;
- regras de negócio;
- critérios de conclusão.

---

## Pendências

Identificar claramente:

- o que ficou para futuras Sprints;
- o que está fora do escopo;
- melhorias futuras.

---

# Restrições

Nunca solicitar alterações que contrariem:

- escopo definido;
- arquitetura oficial;
- regras de negócio aprovadas.

Melhorias futuras deverão ser registradas como recomendação, nunca como impedimento para conclusão da Sprint.

---

# Saída

A revisão deverá apresentar:

## Status Geral

- Aprovado
- Aprovado com recomendações
- Reprovado

---

## Checklist

- Documentação
- Arquitetura
- Backend
- Frontend
- Funcionalidade
- Código

---

## Não Conformidades

...

---

## Recomendações

...

---

## Próximos Passos

...

---

# Critério de Aprovação

Uma funcionalidade somente poderá ser considerada concluída quando:

- cumprir integralmente o Plano de Implementação;
- respeitar toda a documentação oficial;
- manter consistência arquitetural;
- apresentar comportamento funcional esperado;
- não possuir pendências críticas.