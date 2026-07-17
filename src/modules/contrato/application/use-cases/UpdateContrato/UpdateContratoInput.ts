import { z } from "zod"

export const updateContratoSchema = z.object({
  valorBase: z.number().positive("Valor base deve ser positivo").optional(),
  percentualJuros: z.number().min(0).optional(),
  quantidadeParcelas: z.number().int().positive().optional(),
  dataInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD")
    .refine((val) => !isNaN(new Date(val + "T12:00:00Z").getTime()), {
      message: "Data inválida.",
    })
    .optional(),
})

export type UpdateContratoInput = z.infer<typeof updateContratoSchema>
