import { z } from "zod"

export const createGastoSchema = z.object({
  valor: z.number({ required_error: "Valor é obrigatório." }).positive("Valor deve ser maior que zero."),
  categoria: z.string({ required_error: "Categoria é obrigatória." }).min(1).max(50),
  data: z.string({ required_error: "Data é obrigatória." }),
  observacao: z.string().optional(),
})

export type CreateGastoInput = z.infer<typeof createGastoSchema>
