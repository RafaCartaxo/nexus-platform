import { v4 as uuid } from "uuid"
import type { Parcela } from "../contrato.entity.js"
import { parseDateLocal, getLocalDateString } from "../../../../shared/utils/parseDateLocal.js"

export function calcularDataFinal(
  dataInicio: string,
  quantidadeParcelas: number
): string {
  const data = parseDateLocal(dataInicio)
  for (let i = 0; i < quantidadeParcelas; i++) {
    data.setDate(data.getDate() + 1)
    if (data.getDay() === 0) {
      data.setDate(data.getDate() + 1)
    }
  }
  return getLocalDateString(data)
}

export function gerarParcelas(
  contratoId: string,
  valorFinal: number,
  quantidadeParcelas: number,
  dataInicio: string
): Parcela[] {
  const parcelaBase = Math.floor((valorFinal / quantidadeParcelas) * 100) / 100
  const residual =
    Math.round((valorFinal - parcelaBase * quantidadeParcelas) * 100) / 100
  const now = new Date().toISOString()
  const vencimento = parseDateLocal(dataInicio)

  return Array.from({ length: quantidadeParcelas }, (_, i) => {
    const numero = i + 1
    const valorPrevisto =
      numero === quantidadeParcelas
        ? Math.round((parcelaBase + residual) * 100) / 100
        : parcelaBase

    vencimento.setDate(vencimento.getDate() + 1)
    if (vencimento.getDay() === 0) {
      vencimento.setDate(vencimento.getDate() + 1)
    }

    return {
      id: uuid(),
      contratoId,
      numero,
      valorPrevisto,
      valorPago: 0,
      saldoPendente: valorPrevisto,
      estado: "Pendente" as const,
      dataVencimento: getLocalDateString(vencimento),
      dataQuitacao: null,
      createdAt: now,
      updatedAt: now,
    }
  })
}
