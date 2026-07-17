import { v4 as uuid } from "uuid"
import type { IPagamentoRepository } from "../../ports/pagamento.repository.js"
import type { IContratoRepository } from "../../../../contrato/application/ports/contrato.repository.js"
import type { CreatePagamentoInput } from "./CreatePagamentoInput.js"
import { ContratoNotFoundError } from "../../../../contrato/domain/errors/contrato-not-found.error.js"
import { SaldoInsuficienteError } from "../../../../contrato/domain/errors/saldo-insuficiente.error.js"
import { getLocalDateString } from "../../../../../shared/utils/parseDateLocal.js"
import { distribuirPagamento } from "../../../domain/services/distribuir-pagamento.js"

export class CreatePagamentoUseCase {
  constructor(
    private pagamentoRepo: IPagamentoRepository,
    private contratoRepo: IContratoRepository
  ) {}

  async execute(input: CreatePagamentoInput) {
    const now = new Date()
    const data = getLocalDateString(now)
    const createdAt = now.toISOString()

    const pagamentoId = uuid()

    await this.contratoRepo.transaction(async (repo) => {
      const contrato = await repo.findByIdWithParcelas(input.contratoId)
      if (!contrato) {
        throw new ContratoNotFoundError(input.contratoId)
      }

      const preview = distribuirPagamento(contrato.parcelas, input.valor)

      if (input.valor > preview.saldoDevedor) {
        throw new SaldoInsuficienteError(preview.saldoDevedor, input.valor)
      }

      await this.pagamentoRepo.save({
        id: pagamentoId,
        contratoId: input.contratoId,
        valor: input.valor,
        data,
        createdAt,
      })

      for (const item of preview.parcelas) {
        if (item.valorAplicado <= 0) continue

        const parcela = contrato.parcelas.find((p) => p.numero === item.numero)!
        const novoEstado = item.estadoPrevisto === "Paga" ? "Paga" as const : "Parcial" as const
        const dataQuitacao = item.estadoPrevisto === "Paga" ? data : null

        await repo.updateParcela(parcela.id, {
          valorPago: Math.round((parcela.valorPago + item.valorAplicado) * 100) / 100,
          saldoPendente: item.saldoRestante,
          estado: novoEstado,
          dataQuitacao,
          updatedAt: createdAt,
        })

        await this.pagamentoRepo.savePagamentoParcela({
          id: uuid(),
          pagamentoId,
          parcelaId: parcela.id,
          valor: item.valorAplicado,
        })
      }

      if (preview.todasPagas) {
        await repo.update(contrato.id, {
          estado: "Finalizado",
          updatedAt: createdAt,
        })
      }

      const movId = uuid()
      await repo.saveMovimentacaoFinanceira({
        id: movId,
        tipo: "entrada",
        valor: input.valor,
        origem: "Pagamento",
        origemId: pagamentoId,
        data,
        createdAt,
      })
    })

    return { id: pagamentoId, contratoId: input.contratoId, valor: input.valor, data, createdAt }
  }
}
