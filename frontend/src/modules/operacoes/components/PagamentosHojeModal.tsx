import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { X } from "lucide-react"
import { formatCurrency } from "../../../shared/utils/masks.js"
import type { PagamentoDoDiaItem } from "../services/operacoes.service.js"

interface PagamentosHojeModalProps {
  open: boolean
  items: PagamentoDoDiaItem[]
  loading?: boolean
  onClose: () => void
}

export function PagamentosHojeModal({ open, items, loading, onClose }: PagamentosHojeModalProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = ""
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const total = items.reduce((sum, p) => sum + p.valor, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-md bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
          <h3 className="text-lg font-semibold">{t("operacoes.pagamentosHoje")}</h3>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-surface-hover" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">{t("operacoes.nenhumPagamentoHoje")}</p>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((p) => (
                  <div key={p.pagamentoId} className="flex items-center justify-between rounded-md border border-border-light bg-surface p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">{p.clienteNome}</p>
                      <p className="text-xs text-text-muted">{p.createdAt.slice(11, 16)}</p>
                    </div>
                    <p className="ml-3 text-sm font-semibold text-success-text">R$ {formatCurrency(p.valor)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-border-light pt-3 text-right text-sm font-semibold text-text-primary">
                Total: R$ {formatCurrency(total)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
