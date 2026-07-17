import type { ICaixaRepository } from "../../ports/caixa.repository.js"
import type { ListarMovimentacoesInput } from "./ListarMovimentacoesInput.js"

export class ListarMovimentacoesUseCase {
  constructor(private readonly repository: ICaixaRepository) {}

  async execute(input: ListarMovimentacoesInput) {
    return this.repository.listMovimentacoes(input)
  }
}
