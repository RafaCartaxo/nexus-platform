import { Router } from "express"
import { ContratoController } from "../controllers/contrato.controller.js"
import { ContratoRepository } from "../../infrastructure/repositories/contrato.repository.impl.js"
import { ClienteExistenceQuery } from "../../infrastructure/queries/cliente-existence.query.impl.js"

const router = Router()
const repository = new ContratoRepository()
const clienteExistenceQuery = new ClienteExistenceQuery()
const controller = new ContratoController(repository, clienteExistenceQuery)

router.post("/", controller.create.bind(controller))
router.get("/", controller.list.bind(controller))
router.get("/:id", controller.getById.bind(controller))
router.patch("/:id", controller.update.bind(controller))
router.delete("/:id", controller.remove.bind(controller))

export { router as contratoRoutes }
