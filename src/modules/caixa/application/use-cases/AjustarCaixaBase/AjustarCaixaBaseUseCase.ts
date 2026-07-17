import { v4 } from "uuid"
import type { ICaixaRepository } from "../../ports/caixa.repository.js"
import { CaixaNotFoundError } from "../../../domain/errors/caixa.error.js"
import type { AjustarCaixaBaseInput } from "./AjustarCaixaBaseInput.js"

export class AjustarCaixaBaseUseCase {
  constructor(private readonly repository: ICaixaRepository) {}

  async execute(input: AjustarCaixaBaseInput) {
    const caixa = await this.repository.getCaixaConfig()
    if (!caixa) throw new CaixaNotFoundError()

    const diferenca = input.valor - caixa.caixaBase
    const now = new Date().toISOString()
    const hoje = now.split("T")[0]

    await this.repository.updateCaixaBase(diferenca)

    await this.repository.saveMovimentacaoFinanceira({
      id: v4(),
      tipo: diferenca >= 0 ? "entrada" : "saida",
      valor: Math.abs(diferenca),
      origem: "Ajuste",
      descricao: "Ajuste manual do Caixa Base",
      data: hoje,
      createdAt: now,
    })

    const atualizado = await this.repository.getCaixaConfig()
    return { caixaBase: atualizado!.caixaBase }
  }
}
