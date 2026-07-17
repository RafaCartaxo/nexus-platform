import type { IContratoRepository } from "../../ports/contrato.repository.js"
import type { FindContratosQuery } from "./ListContratosQuery.js"

export class ListContratosUseCase {
  constructor(private readonly repository: IContratoRepository) {}

  async execute(query: FindContratosQuery) {
    return this.repository.findAll(query)
  }
}
