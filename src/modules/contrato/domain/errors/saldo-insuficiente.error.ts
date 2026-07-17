export class SaldoInsuficienteError extends Error {
  public readonly code = "INSUFFICIENT_BALANCE"
  constructor(disponivel: number, necessario: number) {
    super(
      `Saldo insuficiente. Disponível: R$ ${disponivel.toFixed(
        2
      )}, necessário: R$ ${necessario.toFixed(2)}`
    )
    this.name = "SaldoInsuficienteError"
  }
}
