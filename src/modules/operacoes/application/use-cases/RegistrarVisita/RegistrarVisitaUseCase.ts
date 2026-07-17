import type { IOperacoesRepository, RegistrarVisitaInput, RegistrarVisitaOutput } from "../../ports/operacoes.repository.js"

export class RegistrarVisitaUseCase {
  constructor(private repo: IOperacoesRepository) {}

  async execute(input: RegistrarVisitaInput): Promise<RegistrarVisitaOutput> {
    return this.repo.registrarVisita(input)
  }
}
