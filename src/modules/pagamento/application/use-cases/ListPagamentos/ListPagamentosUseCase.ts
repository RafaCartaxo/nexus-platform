import type { IPagamentoRepository } from "../../ports/pagamento.repository.js"

export class ListPagamentosUseCase {
  constructor(private pagamentoRepo: IPagamentoRepository) {}

  async execute(contratoId: string) {
    return this.pagamentoRepo.findByContratoId(contratoId)
  }
}
