import type { IClienteRepository } from "../../ports/cliente.repository.js"
import type { FindClientesQuery } from "./ListClientesQuery.js"

export class ListClientesUseCase {
  constructor(private readonly repository: IClienteRepository) {}

  async execute(query: FindClientesQuery) {
    return this.repository.findAll(query)
  }
}
