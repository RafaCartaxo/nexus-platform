import { z } from "zod"

export const createContratoSchema = z.object({
  clienteId: z.string().uuid("Cliente inválido"),
  valorBase: z.number().positive("Valor base deve ser positivo"),
  percentualJuros: z.number().min(0).default(20),
  quantidadeParcelas: z
    .number()
    .int()
    .positive("Quantidade de parcelas deve ser positiva"),
  dataInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD")
    .refine((val) => !isNaN(new Date(val + "T12:00:00Z").getTime()), {
      message: "Data inválida.",
    }),
})

export type CreateContratoInput = z.infer<typeof createContratoSchema>
