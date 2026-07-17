import type { IOperacoesRepository, PagamentoDoDiaItem } from "../../ports/operacoes.repository.js"

export class ListarPagamentosDoDiaUseCase {
  constructor(private repo: IOperacoesRepository) {}

  async execute(dataInicio?: string, dataFim?: string): Promise<PagamentoDoDiaItem[]> {
    return this.repo.listarPagamentosDoDia(dataInicio, dataFim)
  }
}
