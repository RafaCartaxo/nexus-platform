import type { Pagamento, PagamentoParcela, PagamentoComDetalhes } from "../../domain/pagamento.entity.js"

export interface IPagamentoRepository {
  save(pagamento: Pagamento): Promise<void>
  savePagamentoParcela(relacao: PagamentoParcela): Promise<void>
  findByContratoId(contratoId: string): Promise<PagamentoComDetalhes[]>
}
