export class ClienteHasActiveContractsError extends Error {
  public readonly code = "CLIENT_HAS_ACTIVE_CONTRACTS"
  constructor(id: string) {
    super(`Cliente possui contratos ativos: ${id}`)
    this.name = "ClienteHasActiveContractsError"
  }
}
