import { Router } from "express"
import { GastoRepository } from "../../infrastructure/repositories/gasto.repository.impl.js"
import { CaixaRepository } from "../../../caixa/infrastructure/repositories/caixa.repository.impl.js"
import { GastoController } from "../controllers/gasto.controller.js"

const router = Router()
const gastoRepository = new GastoRepository()
const caixaRepository = new CaixaRepository()
const controller = new GastoController(gastoRepository, caixaRepository)

router.post("/", controller.create.bind(controller))
router.get("/", controller.list.bind(controller))
router.delete("/:id", controller.remove.bind(controller))

export { router as gastoRoutes }
