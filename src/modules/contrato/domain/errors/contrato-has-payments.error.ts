export class ContratoHasPaymentsError extends Error {
  public readonly code = "CONTRACT_HAS_PAYMENTS"
  constructor(id: string) {
    super(`Contrato possui pagamentos registrados: ${id}`)
    this.name = "ContratoHasPaymentsError"
  }
}
