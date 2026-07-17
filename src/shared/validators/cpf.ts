export function isValidCpf(value: string): boolean {
  if (!/^\d{11}$/.test(value)) return false

  const digits = value.split("").map(Number)

  if (digits.every((d) => d === digits[0])) return false

  const calc = (base: number[]): number => {
    const sum = base.reduce((acc, d, i) => acc + d * (base.length + 1 - i), 0)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }

  const first = calc(digits.slice(0, 9))
  if (first !== digits[9]) return false

  const second = calc(digits.slice(0, 10))
  if (second !== digits[10]) return false

  return true
}
