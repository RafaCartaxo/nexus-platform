import { z } from "zod"
import type { TFunction } from "i18next"
import { unmaskMonetario } from "../../../shared/utils/masks.js"

export function getContratoSchema(t: TFunction) {
  return z.object({
    valorBase: z
      .string()
      .min(1, t("contrato.validacao.valorPositivo"))
      .refine((val) => unmaskMonetario(val) > 0, t("contrato.validacao.valorPositivo")),
    percentualJuros: z
      .string()
      .refine((val) => parseFloat(val.replace(",", ".")) >= 0, t("contrato.validacao.jurosNaoNegativo")),
    quantidadeParcelas: z
      .string()
      .min(1, t("contrato.validacao.minimo1Parcela"))
      .refine((val) => parseInt(val) >= 1, t("contrato.validacao.minimo1Parcela")),
    dataInicio: z
      .string()
      .min(1, t("contrato.validacao.informeDataInicio")),
  })
}

export type ContratoFormData = z.infer<ReturnType<typeof getContratoSchema>>
