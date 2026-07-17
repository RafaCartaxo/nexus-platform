import type { IGastoRepository } from "../../ports/gasto.repository.js"
import { GastoNotFoundError } from "../../../domain/errors/gasto.error.js"

export class DeleteGastoUseCase {
  constructor(private readonly repository: IGastoRepository) {}

  async execute(id: string) {
    const gasto = await this.repository.findById(id)
    if (!gasto) throw new GastoNotFoundError()

    await this.repository.softDelete(id)
  }
}
