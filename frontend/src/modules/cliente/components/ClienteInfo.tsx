import { ClienteCard } from "./ClienteCard.js"
import type { Cliente } from "../services/cliente.service.js"

interface ClienteInfoProps {
  cliente: Cliente
}

export function ClienteInfo({ cliente }: ClienteInfoProps) {
  return <ClienteCard variant="detail" cliente={cliente} />
}
