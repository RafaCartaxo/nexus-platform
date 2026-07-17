export class ClienteNotFoundError extends Error {
  public readonly code = "CLIENT_NOT_FOUND"
  constructor(id: string) {
    super(`Cliente não encontrado: ${id}`)
    this.name = "ClienteNotFoundError"
  }
}
