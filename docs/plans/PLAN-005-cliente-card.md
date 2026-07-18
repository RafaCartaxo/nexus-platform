# PLAN-005 — ClienteCard: Componentização e Padronização

## Objetivo

Extrair a exibição de dados do cliente para um componente ClienteCard reutilizável,
eliminando markup duplicado entre ClienteList, ClienteInfo e ClienteDetail.

---

## Arquitetura

### Relação entre componentes

`
Página (ClienteList / ClienteDetail)
↓
ClienteCard (componente de domínio — apresentação)
├── variant="list-item" → nome, comércio, telefone, cidade
└── variant="detail"    → comércio, CPF, telefone, endereço completo
↓
Card.Root, Card.Header, Card.Body (Design System — estrutura)
`

ClienteCard **compõe** Card.Root internamente — não o substitui.

Navegação é externa ao componente:
`	sx
<Link to={/clientes/} className="block">
  <ClienteCard variant="list-item" cliente={c} />
</Link>
`

### API final

`	sx
interface ClienteCardProps {
  cliente: Cliente
  variant: "list-item" | "detail"
}
`

Sem s, 	o, loading, disabled, onClick — o componente é puramente de apresentação.

### Responsabilidades

Pode:
- exibir informações do cliente;
- escolher layout conforme variant;
- compor Card.Root, Card.Header, Card.Body, Card.Title.

Não pode:
- conter regras de negócio;
- conter chamadas HTTP;
- conter navegação;
- controlar loading/disabled.

---

## Diagnóstico — Situação atual

### Cards de cliente

| # | Arquivo | Variante | Dados | Problema |
|---|---------|----------|-------|----------|
| 1 | ClienteList.tsx | list-item | Nome, comércio, telefone, cidade | Markup duplicado com ClienteInfo |
| 2 | ClienteInfo.tsx | detail | Comércio, CPF, telefone, endereço | Markup duplicado com ClienteList |
| 3 | ClienteDetail.tsx:64-83 | — | Card de contratos | Não usa Card.Root (inline raw) |

### Fora do escopo

| Arquivo | Motivo |
|---------|--------|
| SaldoInfo.tsx | Informação financeira, domínio separado |
| CobrancaList.tsx | Dados operacionais com ações (WhatsApp, navegar) |
| RotaPage.tsx | Dados operacionais com ações |

---

## Decisões de arquitetura

### Por que ClienteCard e não ClienteSummary + ClienteDetails?

**Decisão:** ClienteCard com variantes.

**Motivo:** Segue o mesmo pattern de Card (variantes list-item, detail, collection),
reduz a quantidade de componentes (1 vs 2) e simplifica a manutenção — muda 1 arquivo, não 2.

### Por que navegação externa?

**Decisão:** ClienteCard não recebe s/	o/onClick.

**Motivo:** Separa responsabilidades — o componente de domínio exibe dados, a página
controla navegação. Evita acoplamento com React Router.

### Por que sem loading/disabled?

**Decisão:** Estado é responsabilidade da página.

**Motivo:** ClienteCard é puramente estático. Loading é controlado por EstadoTela
na página, disabled por props do formulário ou botão.

---

## Checklist de execução

O checklist executável (passo a passo, comandos, critérios de aceite) está em:

> engineering/tasks/2026-07-04/CHECKLIST-FASE4.md

### Resumo das entregas

| # | Entrega | Arq. | Complexidade |
|---|---------|------|--------------|
| P0 | Criar ClienteCard.tsx | 1 novo | Média |
| P1 | Substituir card em ClienteList.tsx | 1 alt | Baixa |
| P2 | Simplificar ClienteInfo.tsx | 1 alt | Baixa |
| P3 | Card de contratos em ClienteDetail.tsx | 1 alt | Baixa |
| P4 | Remover imports não utilizados | 2-3 alt | Muito baixa |
| P5 | Verificação final | 0 | — |

---

## Referências

- product/04-ROADMAP.md §1.10 — Roadmap
- engineering/tasks/2026-07-04/CHECKLIST-FASE4.md — Checklist executável
- shared/components/Card/Card.tsx — Compound component do Card
- design/02-DESIGN-SYSTEM.md §286-303 — Regras de cards
- design/03-COMPONENT-ARCHITECTURE.md §Componentes de Domínio
