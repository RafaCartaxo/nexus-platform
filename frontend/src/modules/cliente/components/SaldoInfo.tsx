import { useTranslation } from "react-i18next"
import { formatCurrency } from "../../../shared/utils/masks.js"
import { KpiCard } from "../../../shared/components/KpiCard/KpiCard.js"

interface SaldoInfoProps {
  saldoDevedor: number
}

export function SaldoInfo({ saldoDevedor }: SaldoInfoProps) {
  const { t } = useTranslation()

  return (
    <KpiCard
      variant={saldoDevedor > 0 ? "danger" : "green"}
      title={t("cliente.saldoDevedor")}
      value={`R$ ${formatCurrency(saldoDevedor)}`}
      valueClassName={saldoDevedor > 0 ? "text-danger-text" : "text-success-text"}
    />
  )
}
