import type { IClienteRepository } from "../../ports/cliente.repository.js"
import { ClienteNotFoundError } from "../../../domain/errors/cliente-not-found.error.js"
import { ClienteHasActiveContractsError } from "../../../domain/errors/cliente-has-active-contracts.error.js"

export class DeleteClienteUseCase {
  constructor(private readonly repository: IClienteRepository) {}

  async execute(id: string): Promise<void> {
    const cliente = await this.repository.findById(id)

    if (!cliente) {
      throw new ClienteNotFoundError(id)
    }

    const hasContracts = await this.repository.hasActiveContracts(id)

    if (hasContracts) {
      throw new ClienteHasActiveContractsError(id)
    }

    await this.repository.softDelete(id)
  }
}
