import { z } from "zod"
import type { TFunction } from "i18next"

export const CATEGORIAS_GASTO = ["Transporte", "Alimentação", "Material", "Manutenção", "Outros"] as const

export const CATEGORIA_ICONES: Record<string, string> = {
  Transporte: "🚗",
  Alimentação: "🍽️",
  Material: "📦",
  Manutenção: "🔧",
  Outros: "📋",
}

export function getGastoSchema(t: TFunction) {
  return z.object({
    valor: z
      .string({ required_error: t("gasto.validacao.valorObrigatorio") })
      .refine(
        (v) => {
          const cleaned = v.replace(/\./g, "").replace(",", ".")
          return parseFloat(cleaned) > 0
        },
        { message: t("gasto.validacao.valorPositivo") },
      ),
    categoria: z
      .string({ required_error: t("gasto.validacao.categoriaObrigatoria") })
      .min(1, t("gasto.validacao.categoriaObrigatoria")),
    data: z.string().min(1),
    observacao: z.string().optional(),
  })
}

export type GastoFormData = z.infer<ReturnType<typeof getGastoSchema>>
