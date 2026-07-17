import { useTranslation } from "react-i18next"
import { Card } from "../../../shared/components/Card/Card.js"
import { maskCpf, maskPhone } from "../../../shared/utils/masks.js"
import type { Cliente } from "../services/cliente.service.js"

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
            <p className="text-sm text-text-secondary">{cliente.comercio}</p>
          )}
          <p className="text-sm text-text-secondary">{maskPhone(cliente.telefone)}</p>
          {cliente.telefoneComercio && (
            <p className="text-sm text-text-secondary">{maskPhone(cliente.telefoneComercio)}</p>
          )}
          {cliente.endereco.cidade && (
            <p className="text-sm text-text-secondary">
              {cliente.endereco.cidade}
              {cliente.endereco.estado ? ` - ${cliente.endereco.estado}` : ""}
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
            <p className="text-sm text-text-secondary">{cliente.comercio}</p>
          )}
          {cliente.cpf && (
            <p className="text-sm text-text-secondary">
              <span className="text-text-muted">{t("cliente.cpf")}</span>{" "}
              {maskCpf(cliente.cpf)}
            </p>
          )}
          <p className="text-sm text-text-secondary">{maskPhone(cliente.telefone)}</p>
          {cliente.telefoneComercio && (
            <p className="text-sm text-text-secondary">{maskPhone(cliente.telefoneComercio)}</p>
          )}
          {cliente.enderecoComercio?.logradouro && (
            <p className="text-sm text-text-secondary">
              📍 {[cliente.enderecoComercio.logradouro, cliente.enderecoComercio.numero, cliente.enderecoComercio.bairro]
                .filter(Boolean).join(", ")}
              {" — "}
              {[cliente.enderecoComercio.cidade, cliente.enderecoComercio.estado].filter(Boolean).join(" - ")}
            </p>
          )}
          <p className="text-sm text-text-secondary">
            {montarEndereco(cliente.endereco)}
          </p>
        </div>
      </Card.Body>
    </Card.Root>
  )
}

export { ClienteCard, type ClienteCardProps }
