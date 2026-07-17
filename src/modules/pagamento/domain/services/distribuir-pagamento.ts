import type { Parcela, EstadoParcela } from "../../../contrato/domain/contrato.entity.js"

export interface ItemDistribuicao {
  numero: number
  valorPrevisto: number
  saldoPendenteAtual: number
  valorAplicado: number
  saldoRestante: number
  estadoPrevisto: EstadoParcela
}

export interface PreviewDistribuicao {
  valorInformado: number
  saldoDevedor: number
  parcelas: ItemDistribuicao[]
  saldoExcedente: number
  todasPagas: boolean
}

export function distribuirPagamento(parcelas: Parcela[], valor: number): PreviewDistribuicao {
  const ativas = parcelas
    .filter((p) => p.saldoPendente > 0)
    .sort((a, b) => a.numero - b.numero)

  const saldoDevedor = ativas.reduce((s, p) => s + p.saldoPendente, 0)

  let restante = valor
  const itens: ItemDistribuicao[] = []

  for (const parcela of ativas) {
    if (restante <= 0) {
      itens.push({
        numero: parcela.numero,
        valorPrevisto: parcela.valorPrevisto,
        saldoPendenteAtual: parcela.saldoPendente,
        valorAplicado: 0,
        saldoRestante: parcela.saldoPendente,
        estadoPrevisto: "Pendente",
      })
      continue
    }

    const aplicar = Math.min(restante, parcela.saldoPendente)
    const novoSaldo = Math.round((parcela.saldoPendente - aplicar) * 100) / 100
    const novoEstado: EstadoParcela = novoSaldo <= 0 ? "Paga" : "Parcial"

    itens.push({
      numero: parcela.numero,
      valorPrevisto: parcela.valorPrevisto,
      saldoPendenteAtual: parcela.saldoPendente,
      valorAplicado: aplicar,
      saldoRestante: novoSaldo,
      estadoPrevisto: novoEstado,
    })

    restante = Math.round((restante - aplicar) * 100) / 100
  }

  const saldoExcedente = restante > 0 ? restante : 0

  const todasPagas = [...parcelas]
    .sort((a, b) => a.numero - b.numero)
    .every((p) => {
      const dist = itens.find((i) => i.numero === p.numero)
      if (dist) return dist.estadoPrevisto === "Paga"
      return p.saldoPendente <= 0
    })

  return {
    valorInformado: valor,
    saldoDevedor,
    parcelas: itens,
    saldoExcedente,
    todasPagas,
  }
}
