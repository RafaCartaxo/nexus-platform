import { useTranslation } from "react-i18next"
import { UserCheck, CalendarClock, MapPinOff, DollarSign } from "lucide-react"

interface RouteProgressProps {
  total: number
  completed: number
  pending: number
  visitados?: number
  promessas?: number
  naoEncontrados?: number
  pagos?: number
}

export function RouteProgress({ total, completed, pending, visitados = 0, promessas = 0, naoEncontrados = 0, pagos = 0 }: RouteProgressProps) {
  const { t } = useTranslation()
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  const lines = [
    { icon: UserCheck, label: t("operacoes.resultado.visitado"), value: visitados },
    { icon: CalendarClock, label: t("operacoes.resultado.promessa"), value: promessas },
    { icon: MapPinOff, label: t("operacoes.resultado.naoEncontrado"), value: naoEncontrados },
    { icon: DollarSign, label: t("operacoes.resumo.pagos"), value: pagos },
  ]

  return (
    <div className="space-y-2 px-6 py-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-sm text-text-secondary">
        {pending} {t("operacoes.pendentes")}
      </p>

      <div className="space-y-1 text-sm text-text-secondary">
        {lines.map(({ icon: Icon, label, value }) => (
          <p key={label} className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5" />
            <span className="flex-1">{label}</span>
            <span className="tabular-nums">{value}</span>
          </p>
        ))}
      </div>
    </div>
  )
}
