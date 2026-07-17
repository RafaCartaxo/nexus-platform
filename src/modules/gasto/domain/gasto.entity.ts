export interface Gasto {
  id: string
  valor: number
  categoria: string
  observacao?: string | null
  data: string
  createdAt: string
  deletedAt?: string | null
}
