# PLAN-011 — Atendidos Hoje

**Status:** Concluído

**Versão:** 1.0

**Dependências:**
- PLAN-009 — Conceito de Atendimento
- PLAN-010 — Fila Operacional de Cobrança

---

# Objetivo

Exibir todos os clientes que receberam atendimento no dia, independentemente do resultado operacional, permitindo ao operador revisar, reengajar e acompanhar o dia.

Complementa a Fila Operacional (PLAN-010): enquanto a fila mostra quem falta atender, o Atendidos Hoje mostra quem já foi atendido.

---

# Conceito

Após qualquer resultado operacional (VISITADO, NAO_ENCONTRADO, PROMESSA), o cliente sai da fila e passa a ser visível apenas no Atendidos Hoje.

Operadores podem:
- revisar o resultado;
- reengajar (WhatsApp, ligação, navegação);
- abrir contrato;
- filtrar por tipo de resultado.

---

# Fluxo

```
Dashboard
  ├── "Cobranças do Dia" → fila (pendentes)
  └── "Atendidos Hoje →" → lista de completos
                              ├── Filtros: Todos | Visitado | Não Encontrado | Promessa
                              └── Card com ações (WhatsApp, Ligar, Abrir)
                                    └── Clique → RotaPage (focusKey)
```

---

# Implementação

## P1 — Criar AtendidosPage

**Arquivo:** `modules/operacoes/pages/AtendidosPage.tsx`

Componente similar à CobrancaListPage, com diferenças:

1. Filtro padrão: `resultadoOperacional !== PENDENTE`
2. Sub-filtros: [Todos][Visitado][Não Encontrado][Promessa]
3. Lista: `CobrancaList` com os completos
4. Ações: `onCardClick` → `/rota?focusKey=`

## P2 — Rota `/atendidos`

**Arquivo:** `App.tsx`

Adicionar `<Route path="/atendidos" element={<AtendidosPage />} />`

## P3 — Link no Dashboard

**Arquivo:** `OperacoesDashboard.tsx`

Botão "Atendidos Hoje →" ao lado de "Ver Todos →"

## P4 — i18n

| Chave | pt-BR | en | es |
|-------|-------|----|----|
| `atendidosHoje` | Atendidos Hoje | Attended Today | Atendidos Hoy |
| `todosResultados` | Todos | All | Todos |

---

# Critérios de Aceitação

- Exibe apenas clientes com `resultadoOperacional !== PENDENTE`.
- Filtros por tipo de resultado funcionam.
- Card tem ações de reengajamento (WhatsApp, Ligar, Abrir).
- Clique no card navega para RotaPage com focusKey.
- Atualiza automaticamente via EventBus.
- `tsc --noEmit` limpo.

---

# Fora do Escopo

- Histórico de atendimentos (multiplos no mesmo cliente).
- Exportação ou relatórios.
- Métricas de produtividade.
