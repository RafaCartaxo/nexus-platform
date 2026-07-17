import type { Cliente } from "../../domain/cliente.entity.js"

export interface FindAllParams {
  nome?: string
  page: number
  limit: number
  sort: string
  order: "asc" | "desc"
}

export interface FindAllResult {
  data: Cliente[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface IClienteRepository {
  save(cliente: Cliente): Promise<void>
  findById(id: string): Promise<Cliente | null>
  findByCpf(cpf: string): Promise<Cliente | null>
  findAll(params: FindAllParams): Promise<FindAllResult>
  update(id: string, data: Partial<Cliente>): Promise<Cliente | null>
  softDelete(id: string): Promise<void>
  hasActiveContracts(clienteId: string): Promise<boolean>
}
