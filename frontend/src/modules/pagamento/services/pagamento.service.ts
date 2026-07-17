import { apiRequest } from "../../../api/client.js"

export interface Pagamento {
  id: string
  contratoId: string
  valor: number
  data: string
  createdAt: string
}

export interface PagamentoParcela {
  id: string
  pagamentoId: string
  parcelaId: string
  valor: number
}

export interface PagamentoComDetalhes extends Pagamento {
  parcelas: PagamentoParcela[]
}

export interface ItemPreview {
  numero: number
  valorPrevisto: number
  saldoPendenteAtual: number
  valorAplicado: number
  saldoRestante: number
  estadoPrevisto: "Pendente" | "Parcial" | "Paga"
}

export interface PreviewDistribuicao {
  valorInformado: number
  saldoDevedor: number
  parcelas: ItemPreview[]
  saldoExcedente: number
  todasPagas: boolean
}

export async function createPagamento(data: {
  contratoId: string
  valor: number
}): Promise<Pagamento> {
  return apiRequest<Pagamento>("POST", "/pagamentos", data)
}

export async function previewPagamento(data: {
  contratoId: string
  valor: number
}): Promise<PreviewDistribuicao> {
  return apiRequest<PreviewDistribuicao>("POST", "/pagamentos/preview", data)
}

export async function listPagamentos(
  contratoId: string
): Promise<PagamentoComDetalhes[]> {
  return apiRequest<PagamentoComDetalhes[]>(
    "GET",
    `/pagamentos/contrato/${contratoId}`
  )
}
