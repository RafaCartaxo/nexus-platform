import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Play, MapPin, CheckCircle } from "lucide-react"
import { Button } from "../../../shared/components/Button.js"

interface RotaCobrancaSectionProps {
  totalClientes: number
  distanciaTotal: number
}

export function RotaCobrancaSection({
  totalClientes,
  distanciaTotal,
}: RotaCobrancaSectionProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-6 rounded-md border border-border-light bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-text-muted" />
          <h2 className="text-lg font-semibold text-text-primary">{t("operacoes.rotaCobranca")}</h2>
        </div>
        {totalClientes > 0 ? (
          <Link to="/rota">
            <Button className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              {t("operacoes.iniciarRota")}
            </Button>
          </Link>
        ) : (
          <span className="flex items-center gap-1 text-sm font-medium text-success">
            <CheckCircle className="h-4 w-4" />
            {t("operacoes.rotaConcluida")}
          </span>
        )}
      </div>
      <div className="mt-2 flex gap-4 text-sm text-text-secondary">
        <span>{totalClientes} {t("operacoes.clientes")}</span>
        {distanciaTotal > 0 && <span>&middot; ~{distanciaTotal} {t("operacoes.distancia")}</span>}
      </div>
    </div>
  )
}
