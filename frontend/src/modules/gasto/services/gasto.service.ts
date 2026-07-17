import { apiRequest } from "../../../api/client.js"

export interface GastoItem {
  id: string
  valor: number
  categoria: string
  observacao?: string | null
  data: string
  createdAt: string
}

export interface CreateGastoInput {
  valor: number
  categoria: string
  data: string
  observacao?: string
}

export interface ListGastosResult {
  data: GastoItem[]
  totalPeriodo: number
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export async function createGasto(data: CreateGastoInput): Promise<GastoItem> {
  return apiRequest<GastoItem>("POST", "/gastos", data)
}

export async function listGastos(params?: {
  dataInicio?: string
  dataFim?: string
  page?: number
  limit?: number
}): Promise<ListGastosResult> {
  const qs = new URLSearchParams()
  if (params?.dataInicio) qs.set("dataInicio", params.dataInicio)
  if (params?.dataFim) qs.set("dataFim", params.dataFim)
  if (params?.page) qs.set("page", String(params.page))
  if (params?.limit) qs.set("limit", String(params.limit))
  const query = qs.toString()
  return apiRequest<ListGastosResult>("GET", `/gastos${query ? `?${query}` : ""}`)
}

export async function deleteGasto(id: string): Promise<void> {
  return apiRequest<void>("DELETE", `/gastos/${id}`)
}
