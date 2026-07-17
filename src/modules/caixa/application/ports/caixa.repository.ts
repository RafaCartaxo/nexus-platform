import type { CaixaConfig, MovimentacaoFinanceira, FechamentoSemanal } from "../../domain/caixa.entity.js"

export interface ListMovimentacoesParams {
  dataInicio?: string
  dataFim?: string
  origem?: string
  page?: number
  limit?: number
}

export interface ListMovimentacoesResult {
  data: MovimentacaoFinanceira[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ICaixaRepository {
  getCaixaConfig(): Promise<CaixaConfig | null>
  updateCaixaBase(valor: number): Promise<void>
  saveMovimentacaoFinanceira(m: MovimentacaoFinanceira): Promise<void>
  listMovimentacoes(params: ListMovimentacoesParams): Promise<ListMovimentacoesResult>
  getRecebidoSemana(dataInicio: string, dataFim: string): Promise<number>
  getGastoSemana(dataInicio: string, dataFim: string): Promise<number>
  getSaldoAtual(dataInicio?: string): Promise<number>
  getAReceberHoje(): Promise<number>
  getRecebidoHoje(): Promise<number>
  getVendasSemana(dataInicio: string, dataFim: string): Promise<number>
  getUltimaLiquidacao(): Promise<FechamentoSemanal | null>
  getLucro(): Promise<number>
  saveFechamentoSemanal(f: FechamentoSemanal): Promise<void>
  findFechamentoPorPeriodo(dataInicio: string, dataFim: string): Promise<FechamentoSemanal | null>
}
