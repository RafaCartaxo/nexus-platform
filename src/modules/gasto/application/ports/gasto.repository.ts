import type { Gasto } from "../../domain/gasto.entity.js"

export interface ListGastosParams {
  dataInicio?: string
  dataFim?: string
  page?: number
  limit?: number
}

export interface ListGastosResult {
  data: Gasto[]
  totalPeriodo: number
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface IGastoRepository {
  save(gasto: Gasto): Promise<void>
  findAll(params: ListGastosParams): Promise<ListGastosResult>
  findById(id: string): Promise<Gasto | null>
  softDelete(id: string): Promise<void>
}
