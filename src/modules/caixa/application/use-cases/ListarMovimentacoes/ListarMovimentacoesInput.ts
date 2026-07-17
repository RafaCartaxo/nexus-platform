import { z } from "zod"

export const listarMovimentacoesSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  origem: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type ListarMovimentacoesInput = z.infer<typeof listarMovimentacoesSchema>
