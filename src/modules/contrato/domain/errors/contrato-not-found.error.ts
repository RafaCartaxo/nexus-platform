export class ContratoNotFoundError extends Error {
  public readonly code = "CONTRACT_NOT_FOUND"
  constructor(id: string) {
    super(`Contrato não encontrado: ${id}`)
    this.name = "ContratoNotFoundError"
  }
}
