import { z } from "zod"

export const createPagamentoSchema = z.object({
  contratoId: z.string().uuid(),
  valor: z.number().positive("Valor deve ser positivo"),
})

export type CreatePagamentoInput = z.infer<typeof createPagamentoSchema>
