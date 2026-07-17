export class CaixaNotFoundError extends Error {
  code = "CAIXA_NOT_FOUND"
  constructor() {
    super("Configuração do Caixa não encontrada.")
    this.name = "CaixaNotFoundError"
  }
}

export class SemanaJaLiquidadaError extends Error {
  code = "SEMANA_JA_LIQUIDADA"
  constructor() {
    super("Esta semana já foi liquidada.")
    this.name = "SemanaJaLiquidadaError"
  }
}
