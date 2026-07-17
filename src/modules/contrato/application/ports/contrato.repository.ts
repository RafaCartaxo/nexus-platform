import type {
  Contrato,
  Parcela,
  ContratoComParcelas,
  CaixaConfig,
  MovimentacaoFinanceira,
} from "../../domain/contrato.entity.js"

export interface FindAllParams {
  clienteId?: string
  dataInicio?: string
  dataFim?: string
  page: number
  limit: number
  sort: string
  order: "asc" | "desc"
}

export interface FindAllResult {
  data: Contrato[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface IContratoRepository {
  save(contrato: Contrato): Promise<void>
  saveParcela(parcela: Parcela): Promise<void>
  updateParcela(id: string, data: Partial<Parcela>): Promise<void>
  findById(id: string): Promise<Contrato | null>
  findByIdWithParcelas(id: string): Promise<ContratoComParcelas | null>
  findAll(params: FindAllParams): Promise<FindAllResult>
  findParcelasByContratoId(contratoId: string): Promise<Parcela[]>
  update(id: string, data: Partial<Contrato>): Promise<Contrato | null>
  softDelete(id: string): Promise<void>
  softDeleteParcelasByContratoId(contratoId: string): Promise<void>
  hasPayments(contratoId: string): Promise<boolean>
  getCaixaConfig(): Promise<CaixaConfig | null>
  updateCaixaBase(valor: number): Promise<void>
  saveMovimentacaoFinanceira(mov: MovimentacaoFinanceira): Promise<void>

  transaction<T>(fn: (repo: IContratoRepository) => Promise<T>): Promise<T>
  getSaldoAtual(): Promise<number>
}
