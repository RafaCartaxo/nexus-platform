import type { IOperacoesRepository, ParcelaHojeCliente } from "../../ports/operacoes.repository.js"

export class ListarParcelasSemanaUseCase {
  constructor(private repo: IOperacoesRepository) {}

  async execute(): Promise<ParcelaHojeCliente[]> {
    return this.repo.listarParcelasSemana()
  }
}
