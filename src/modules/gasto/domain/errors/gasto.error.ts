export class GastoNotFoundError extends Error {
  code = "GASTO_NOT_FOUND"
  constructor() {
    super("Gasto não encontrado.")
    this.name = "GastoNotFoundError"
  }
}
