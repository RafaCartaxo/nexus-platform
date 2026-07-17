import { z } from "zod"

export const ajustarCaixaBaseSchema = z.object({
  valor: z.number({ required_error: "Valor é obrigatório." }).positive("Valor deve ser positivo."),
})

export type AjustarCaixaBaseInput = z.infer<typeof ajustarCaixaBaseSchema>
