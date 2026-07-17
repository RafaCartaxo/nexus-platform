import { ContratoCard } from "./ContratoCard.js"
import type { Contrato } from "../services/contrato.service.js"

interface ContratoInfoProps {
  contrato: Contrato
}

export function ContratoInfo({ contrato }: ContratoInfoProps) {
  return <ContratoCard variant="detail" contrato={contrato} />
}
