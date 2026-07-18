# CHECKLIST — Fase 4 (ClienteCard)

**Status:** Em andamento

**Início:** 04/07/2026

**Roadmap:** product/04-ROADMAP.md §1.10

**Plano:** plans/PLAN-005-cliente-card.md

---

## Objetivo

Extrair a exibição de dados do cliente para um componente ClienteCard reutilizável,
eliminando markup duplicado entre ClienteList, ClienteInfo e ClienteDetail,
e substituir card inline de contratos em ClienteDetail por Card.Root.

**Status:** Concluído ✅

---

## Pré-requisitos (ler antes de começar)

Antes de executar qualquer entrega, ler:

| Arquivo | Por que ler |
|---------|-------------|
| shared/components/Card/Card.tsx | Entender o compound pattern (Root, Header, Body, Title) |
| modules/cliente/pages/ClienteList.tsx | Card atual que será substituído |
| modules/cliente/components/ClienteInfo.tsx | Card atual que será simplificado |
| modules/cliente/pages/ClienteDetail.tsx | Card inline de contratos (linhas 64-83) |
| design/02-DESIGN-SYSTEM.md (§286-303) | Regras de cards (hover, padding, sombra) |
| plans/PLAN-005-cliente-card.md | Plano detalhado com arquitetura e decisões |

---

## Convenções

- **Navegação externa:** ClienteCard NÃO recebe s/	o/onClick — o componente é puramente de apresentação. A página wrapper com <Link> ou <Card.Root as="link">.
- **Sem loading/disabled:** ClienteCard não controla estados — isso é responsabilidade da página.
- **i18n:** Strings de títulos (ex: "Dados do Cliente") via 	(), campos de dados (nome, CPF) são valores que vêm do objeto cliente.
- **Masks:** maskPhone() e maskCpf() de shared/utils/masks.ts — já existem e são reutilizados.

---

## Ordem de execução (linear, sem retrabalho)

`
P0 → P1 → P2 → P3 → P4 → P5

Cada entrega depende da anterior.
Pare se alguma entrega falhar em tsc --noEmit ou verificação visual.
`

---

## P0 — Criar ClienteCard.tsx

**Depende de:** —  
**Complexidade:** Média  
**Arquivos tocados:** 1 (novo)

### Ação

Criar modules/cliente/components/ClienteCard.tsx

### Estrutura esperada

`	sx
import { useTranslation } from "react-i18next"
import { Card } from "../../../shared/components/Card/Card.js"
import { maskCpf, maskPhone } from "../../../shared/utils/masks.js"
import type { Cliente } from "../../services/cliente.service.js"

interface ClienteCardProps {
  cliente: Cliente
  variant: "list-item" | "detail"
}

function montarEndereco(endereco: Cliente["endereco"]): string {
  const rua = [endereco.logradouro, endereco.numero, endereco.complemento, endereco.bairro]
    .filter(Boolean)
    .join(", ")
  const cidade = [endereco.cidade, endereco.estado].filter(Boolean).join(" - ")
  return [rua, cidade].filter(Boolean).join(" — ")
}

function ClienteCard({ cliente, variant }: ClienteCardProps) {
  const { t } = useTranslation()

  if (variant === "list-item") {
    return (
      <Card.Root variant="list-item">
        <Card.Body>
          <Card.Title className="mb-1">{cliente.nome}</Card.Title>
          {cliente.comercio && (
            <p className="text-sm text-gray-500">{cliente.comercio}</p>
          )}
          <p className="text-sm text-gray-500">{maskPhone(cliente.telefone)}</p>
          {cliente.endereco.cidade && (
            <p className="text-sm text-gray-500">
              {cliente.endereco.cidade}
              {cliente.endereco.estado ?  -  : ""}
            </p>
          )}
        </Card.Body>
      </Card.Root>
    )
  }

  return (
    <Card.Root variant="detail">
      <Card.Header>
        <Card.Title className="text-lg font-semibold">
          {t("cliente.dadosCliente")}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="space-y-1">
          {cliente.comercio && (
            <p className="text-sm text-gray-500">{cliente.comercio}</p>
          )}
          {cliente.cpf && (
            <p className="text-sm text-gray-600">
              <span className="text-gray-400">{t("cliente.cpf")}</span>{" "}
              {maskCpf(cliente.cpf)}
            </p>
          )}
          <p className="text-sm text-gray-600">{maskPhone(cliente.telefone)}</p>
          <p className="text-sm text-gray-600">
            {montarEndereco(cliente.endereco)}
          </p>
        </div>
      </Card.Body>
    </Card.Root>
  )
}

export { ClienteCard, type ClienteCardProps }
`

### Critério de aceite

- [x] ClienteCard compila isoladamente
- [x] Aceita ariant="list-item" e ariant="detail"
- [x] Não possui props s, 	o, loading, disabled, onClick
- [ ] 	sc --noEmit limpo

---

## P1 — Substituir card em ClienteList.tsx

**Depende de:** P0  
**Complexidade:** Baixa  
**Arquivos tocados:** 1 (alterado)

### Ação

Substituir o Card.Root inline por <ClienteCard> + <Link> externo.

**Antes** (ClienteList.tsx:85-96):
`	sx
<Card.Root key={c.id} variant="list-item" as="link" to={/clientes/}>
  <Card.Body>
    <Card.Title className="mb-1">{c.nome}</Card.Title>
    {c.comercio && <p className="text-sm text-gray-500">{c.comercio}</p>}
    <p className="text-sm text-gray-500">{maskPhone(c.telefone)}</p>
    {c.endereco.cidade && (
      <p className="text-sm text-gray-500">
        {c.endereco.cidade}
        {c.endereco.estado ?  -  : ""}
      </p>
    )}
  </Card.Body>
</Card.Root>
`

**Depois**:
`	sx
<Link key={c.id} to={/clientes/} className="block">
  <ClienteCard variant="list-item" cliente={c} />
</Link>
`

### Ajustes necessários

- Importar Link de eact-router-dom (já deve existir no arquivo)
- Importar ClienteCard de ./components/ClienteCard.js (novo import)
- Remover import de Card se não usado em outro lugar no arquivo
- Verificar se maskPhone ainda é usado fora do card (se não, remover)

### Critério de aceite

- [ ] Visual: cards na lista de clientes têm mesma aparência (nome bold, comércio gray, telefone gray, cidade gray)
- [ ] Visual: hover muda borda para azul (hover:border-blue-300)
- [ ] Funcional: clique no card navega para /clientes/:id
- [ ] 	sc --noEmit limpo

---

## P2 — Simplificar ClienteInfo.tsx

**Depende de:** P0  
**Complexidade:** Baixa  
**Arquivos tocados:** 1 (alterado)

### Ação

Substituir o conteúdo do componente por um wrapper para ClienteCard.

**Antes** (ClienteInfo.tsx:10-44):
`	sx
export function ClienteInfo({ cliente }: ClienteInfoProps) {
  const { t } = useTranslation()
  const endereco = [cliente.endereco.logradouro, ...].filter(Boolean).join(", ")
  return (
    <Card.Root variant="detail">
      <Card.Header>
        <Card.Title>{t("cliente.dadosCliente")}</Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="mt-1 space-y-1">
          {cliente.comercio && (<p>...</p>)}
          {cliente.cpf && (<p>...</p>)}
          <p>{maskPhone(cliente.telefone)}</p>
          <p>{endereco}...</p>
        </div>
      </Card.Body>
    </Card.Root>
  )
}
`

**Depois** (arquivo simplificado):
`	sx
import { ClienteCard } from "./ClienteCard.js"
import type { Cliente } from "../services/cliente.service.js"

interface ClienteInfoProps {
  cliente: Cliente
}

export function ClienteInfo({ cliente }: ClienteInfoProps) {
  return <ClienteCard variant="detail" cliente={cliente} />
}
`

### Decisões

- Manter ClienteInfo.tsx como arquivo (wrapper) para não quebrar imports em ClienteDetail.tsx
- Se preferir, pode remover o arquivo e alterar ClienteDetail.tsx para importar ClienteCard diretamente — escolha de projeto

### Ajustes necessários

- Remover imports de useTranslation, Card, maskCpf, maskPhone
- Adicionar import de ClienteCard
- Remover função endereco (agora em montarEndereco interno do ClienteCard)

### Critério de aceite

- [ ] Visual: card de detalhe mantém mesma aparência (header "Dados do Cliente", comércio, CPF, telefone, endereço)
- [ ] ClienteInfo continua exportando ClienteInfoProps (não quebrar consumers)
- [ ] 	sc --noEmit limpo

---

## P3 — Card de contratos em ClienteDetail.tsx

**Depende de:** — (independente, mas executa após P2 para evitar conflitos de merge)  
**Complexidade:** Baixa  
**Arquivos tocados:** 1 (alterado)

### Ação

Substituir <div className="rounded-md border bg-white p-4"> por <Card.Root>.

**Antes** (ClienteDetail.tsx:64-83):
`	sx
<div className="rounded-md border bg-white p-4">
  <h3 className="text-lg font-semibold">{t("cliente.contratos")}</h3>
  <p className="mt-1 text-lg font-semibold">
    {t("cliente.contratosCount", { count: cliente.totalContratos ?? 0 })}
  </p>
  <div className="mt-2 flex gap-2">
    <Link to={/contratos?clienteId=}
      className="inline-flex items-center gap-0.5 text-sm text-blue-600 hover:underline"
    >
      {t("cliente.verContratos")} <ChevronRight className="h-4 w-4" />
    </Link>
    <Link to={/contratos/novo?clienteId=}
      className="inline-flex items-center gap-0.5 text-sm text-blue-600 hover:underline"
    >
      {t("cliente.novoContrato")} <ChevronRight className="h-4 w-4" />
    </Link>
  </div>
</div>
`

**Depois**:
`	sx
<Card.Root variant="detail">
  <Card.Header>
    <Card.Title className="text-lg font-semibold">{t("cliente.contratos")}</Card.Title>
  </Card.Header>
  <Card.Body>
    <p className="text-lg font-semibold">
      {t("cliente.contratosCount", { count: cliente.totalContratos ?? 0 })}
    </p>
    <div className="mt-2 flex gap-2">
      <Link to={/contratos?clienteId=}
        className="inline-flex items-center gap-0.5 text-sm text-blue-600 hover:underline"
      >
        {t("cliente.verContratos")} <ChevronRight className="h-4 w-4" />
      </Link>
      <Link to={/contratos/novo?clienteId=}
        className="inline-flex items-center gap-0.5 text-sm text-blue-600 hover:underline"
      >
        {t("cliente.novoContrato")} <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  </Card.Body>
</Card.Root>
`

### Ajustes necessários

- Adicionar import de Card (de shared/components/Card/Card.js)
- Remover a <div> externa e o <h3> manual

### Critério de aceite

- [ ] Visual: card mantém padding, borda, fundo branco idênticos
- [ ] Visual: título "Contratos" aparece dentro do header do card
- [ ] Funcional: links "Ver contratos" e "Novo contrato" continuam navegando
- [ ] 	sc --noEmit limpo

---

## P4 — Remover imports não utilizados

**Depende de:** P1, P2, P3  
**Complexidade:** Muito baixa  
**Arquivos tocados:** 2-3

### Ação

- ClienteList.tsx: verificar se maskPhone ainda é usado (se o único uso era no card removido, eliminar o import)
- ClienteInfo.tsx: se simplificado para wrapper, remover imports de useTranslation, Card, maskCpf, maskPhone
- ClienteDetail.tsx: verificar se não há imports órfãos

### Critério de aceite

- [ ] grep para cada import removido confirma zero ocorrências no arquivo
- [ ] 	sc --noEmit limpo

---

## P5 — Verificação final

**Depende de:** P4  
**Complexidade:** —  
**Arquivos tocados:** 0

### Checklist

- [ ] 	sc --noEmit — **ZERO erros**
- [ ] Navegar em /clientes — cards com mesma aparência, clique navega
- [ ] Navegar em /clientes/:id — card "Dados do Cliente" com mesma aparência
- [ ] Navegar em /clientes/:id — card "Contratos" usa Card.Root
- [ ] ClienteCard não possui s, 	o, loading, disabled, onClick
- [ ] Nenhum card inline de cliente fora de ClienteCard
- [ ] Nenhum card estrutural (borda+padding) criado manualmente com classes raw

---

## Resumo

| # | Entrega | Arq. novos | Arq. alterados | Complexidade | Status |
|---|---------|-----------|----------------|--------------|--------|
| P0 | Criar ClienteCard.tsx | 1 | 0 | Média | ✅ |
| P1 | Substituir card em ClienteList.tsx | 0 | 1 | Baixa | ✅ |
| P2 | Simplificar ClienteInfo.tsx | 0 | 1 | Baixa | ✅ |
| P3 | Card de contratos em ClienteDetail.tsx | 0 | 1 | Baixa | ✅ |
| P4 | Remover imports não utilizados | 0 | 1 | Muito baixa | ✅ |
| P5 | Verificação final | 0 | 0 | — | ✅ |

---

## Referências

- product/04-ROADMAP.md §1.10 — Roadmap oficial
- plans/PLAN-005-cliente-card.md — Plano detalhado
- shared/components/Card/Card.tsx — Compound component do Card
- design/02-DESIGN-SYSTEM.md §286-303 — Regras de cards
- design/03-COMPONENT-ARCHITECTURE.md §Componentes de Domínio — Arquitetura
