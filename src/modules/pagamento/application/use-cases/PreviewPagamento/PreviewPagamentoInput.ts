import { z } from "zod"

export const previewPagamentoSchema = z.object({
  contratoId: z.string().uuid(),
  valor: z.number().positive("Valor deve ser positivo"),
})

export type PreviewPagamentoInput = z.infer<typeof previewPagamentoSchema>
