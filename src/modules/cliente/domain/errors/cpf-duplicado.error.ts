export class CpfDuplicadoError extends Error {
  public readonly code = "CPF_DUPLICATED"

  constructor(cpf: string) {
    super(`CPF já cadastrado: ${cpf}`)
    this.name = "CpfDuplicadoError"
  }
}
