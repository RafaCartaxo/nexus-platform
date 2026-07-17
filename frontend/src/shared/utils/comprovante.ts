export interface ComprovanteData {
  nome: string
  valor: number
  parcelasTexto: string
  saldoRestante: number
  dataTexto: string
}

const COR_VERDE = "#16A34A"
const COR_TEXTO = "#1F2937"
const COR_LABEL = "#6B7280"
const COR_BORDA = "#D1D5DB"
const COR_RODAPE = "#9CA3AF"
const BRANCO = "#FFFFFF"

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

function fmt(valor: number): string {
  return valor.toFixed(2).replace(".", ",")
}

export function gerarComprovante(data: ComprovanteData): HTMLCanvasElement {
  const W = 320, H = 440
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H

  try {
    const ctx = canvas.getContext("2d")
    if (!ctx) return canvas

    ctx.font = `500 10px ${FONT}`
    ctx.fillStyle = BRANCO
    ctx.fillRect(0, 0, W, H)

    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(6, 6, W - 12, H - 12, 10)
    else ctx.rect(6, 6, W - 12, H - 12)
    ctx.fill()
    ctx.strokeStyle = COR_BORDA
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(36, 38, 10, 0, Math.PI * 2)
    ctx.fillStyle = COR_VERDE
    ctx.fill()

    ctx.font = `700 14px ${FONT}`
    ctx.fillStyle = BRANCO
    ctx.fillText("✓", 31, 45)

    ctx.font = `600 14px ${FONT}`
    ctx.fillStyle = COR_TEXTO
    ctx.fillText("PAGAMENTO CONFIRMADO", 56, 44)

    ctx.beginPath()
    ctx.moveTo(24, 56)
    ctx.lineTo(W - 24, 56)
    ctx.strokeStyle = COR_BORDA
    ctx.lineWidth = 1
    ctx.stroke()

    const rows = [
      { l: "Cliente", v: data.nome },
      { l: "Valor pago", v: `R$ ${fmt(data.valor)}` },
      { l: "Parcelas", v: data.parcelasTexto },
      { l: "Saldo devedor", v: `R$ ${fmt(data.saldoRestante)}` },
      { l: "Data", v: data.dataTexto },
    ]

    rows.forEach((r, i) => {
      const y = 76 + i * 28
      ctx.font = `500 10px ${FONT}`
      ctx.fillStyle = COR_LABEL
      ctx.fillText(r.l, 32, y)
      ctx.font = `600 12px ${FONT}`
      ctx.fillStyle = COR_TEXTO
      ctx.fillText(r.v, 32, y + 14)
    })

    ctx.textAlign = "center"
    ctx.font = `400 9px ${FONT}`
    ctx.fillStyle = COR_RODAPE
    ctx.fillText("Gestão de Cobranças", W / 2, H - 4)
  } catch {}

  return canvas
}
