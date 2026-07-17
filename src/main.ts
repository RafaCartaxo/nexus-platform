import express from "express"
import cors from "cors"
import { createTables } from "./database.js"
import { clienteRoutes } from "./modules/cliente/presentation/routes/cliente.routes.js"
import { contratoRoutes } from "./modules/contrato/presentation/routes/contrato.routes.js"
import { pagamentoRoutes } from "./modules/pagamento/presentation/routes/pagamento.routes.js"
import { operacoesRoutes } from "./modules/operacoes/presentation/routes/operacoes.routes.js"
import { caixaRoutes } from "./modules/caixa/presentation/routes/caixa.routes.js"
import { gastoRoutes } from "./modules/gasto/presentation/routes/gasto.routes.js"

createTables()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/clientes", clienteRoutes)
app.use("/api/contratos", contratoRoutes)
app.use("/api/pagamentos", pagamentoRoutes)
app.use("/api/operacoes", operacoesRoutes)
app.use("/api/caixa", caixaRoutes)
app.use("/api/gastos", gastoRoutes)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Erro não tratado:", err)
  res.status(500).json({ code: "INTERNAL_ERROR", message: "Erro interno do servidor." })
})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
