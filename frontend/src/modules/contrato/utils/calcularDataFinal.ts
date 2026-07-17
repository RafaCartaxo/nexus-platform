import { parseDateLocal, getLocalDateString } from "../../../shared/utils/parseDateLocal.js"

export function calcularDataFinal(
  dataInicio: string,
  quantidadeParcelas: number
): string {
  const data = parseDateLocal(dataInicio)
  for (let i = 0; i < quantidadeParcelas; i++) {
    data.setDate(data.getDate() + 1)
    if (data.getDay() === 0) {
      data.setDate(data.getDate() + 1)
    }
  }
  return getLocalDateString(data)
}
