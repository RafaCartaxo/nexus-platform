import { parseDateLocal } from "./parseDateLocal.js"

const monthKeys = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

export function formatarData(data: string, t: (key: string) => string): string {
  const date = parseDateLocal(data)
  const day = String(date.getDate()).padStart(2, "0")
  return `${day} ${t(`months.${monthKeys[date.getMonth()]}`)}`
}
