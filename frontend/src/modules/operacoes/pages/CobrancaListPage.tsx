import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { listarCobrancasDoDia, listarPagamentosHoje, ResultadoOperacional, type CobrancaDoDiaResult, type CobrancaItem, type PagamentoDoDiaItem } from "../services/operacoes.service.js"
import { eventBus } from "../../../shared/events/eventBus.js"
import { ApiError } from "../../../api/client.js"
import { sortByDistance, useWatchPosition } from "../../../shared/utils/distance.js"
import { CobrancaList } from "../components/CobrancaList.js"
import { ErrorBanner } from "../../../shared/components/ErrorBanner/ErrorBanner.js"
import { SuccessState } from "../../../shared/components/SuccessState/SuccessState.js"

const filtrosResultado = [
  { key: "all", labelKey: "operacoes.todosResultados" },
  { key: "VISITADO", labelKey: "operacoes.resultado.visitado" },
  { key: "NAO_ENCONTRADO", labelKey: "operacoes.resultado.naoEncontrado" },
  { key: "PROMESSA", labelKey: "operacoes.resultado.promessa" },
]

const filtrosSituacao = [
  { key: "all", labelKey: "operacoes.todosResultados" },
  { key: "venceHoje", labelKey: "status.venceHoje" },
  { key: "atrasado", labelKey: "status.atrasado" },
]

export function CobrancaListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filter = searchParams.get("filter")

  const { lat, lng, gpsAtivo } = useWatchPosition()
  const coordsRef = useRef({ lat, lng, gpsAtivo })
  coordsRef.current = { lat, lng, gpsAtivo }

  const [data, setData] = useState<CobrancaDoDiaResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagamentosHoje, setPagamentosHoje] = useState<PagamentoDoDiaItem[]>([])
  const [subFiltro, setSubFiltro] = useState("all")

  const fetch = useCallback(async () => {
    const { lat: refLat, lng: refLng, gpsAtivo: refGps } = coordsRef.current
    setLoading(true)
    setError(null)
    try {
      const result = await listarCobrancasDoDia(
        refGps && typeof refLat === "number" ? refLat : undefined,
        refGps && typeof refLng === "number" ? refLng : undefined,
      )
      setData(result)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(t("operacoes.error"))
      }
    } finally {
      setLoading(false)
    }
  }, [t])

  const fetchPagamentos = useCallback(async () => {
    try {
      const result = await listarPagamentosHoje()
      setPagamentosHoje(result)
    } catch {
      setPagamentosHoje([])
    }
  }, [])

  useEffect(() => {
    fetch()
    fetchPagamentos()
  }, [fetch, fetchPagamentos])

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        fetch()
        fetchPagamentos()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [fetch, fetchPagamentos])

  useEffect(() => {
    const off = eventBus.on("operacao:atualizada", () => { fetch(); fetchPagamentos() })
    return () => off()
  }, [fetch, fetchPagamentos])

  const pendentes = useMemo(
    () => data ? (filter === "atrasado"
      ? data.cobrancas.filter(
          (i) => i.situacao === "atrasado" && (subFiltro === "all" || i.resultadoOperacional === subFiltro),
        )
      : sortByDistance(data.cobrancas, lat, lng).filter(
          (i) => i.resultadoOperacional === ResultadoOperacional.PENDENTE && (subFiltro === "all" || i.situacao === subFiltro),
        )
    ) : [],
    [data, lat, lng, filter, subFiltro],
  )

  const completos = useMemo(
    () => data?.cobrancas.filter((i) => i.resultadoOperacional !== ResultadoOperacional.PENDENTE) ?? [],
    [data],
  )

  const pagosCount = useMemo(
    () => new Set(pagamentosHoje.map((p) => p.clienteId)).size,
    [pagamentosHoje],
  )

  const totalResolvidos = completos.length + pagosCount

  function handleCardClick(item: CobrancaItem) {
    if (filter === "atrasado") {
      navigate(`/contratos/${item.contratoId}`)
    } else {
      navigate("/rota", { state: { focusKey: `${item.clienteId}-${item.contratoId}` } })
    }
  }

  const filtrosAtivos = filter === "atrasado" ? filtrosResultado : filtrosSituacao

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-text-muted hover:text-text-primary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-3xl font-semibold">{filter === "atrasado" ? t("operacoes.atrasado") : t("operacoes.cobrancasDoDia")}</h1>
        {!(pendentes.length === 0 && totalResolvidos > 0) && (
          <button
            type="button"
            onClick={() => navigate("/rota")}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("operacoes.verNaRota")} →
          </button>
        )}
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {filtrosAtivos.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setSubFiltro(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              subFiltro === f.key
                ? "bg-primary text-white"
                : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {error && (
        <ErrorBanner message={error} onRetry={fetch} className="mb-4" />
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-md bg-secondary-light" />
          ))}
        </div>
      ) : pendentes.length === 0 && totalResolvidos > 0 ? (
        <SuccessState
          title={t("operacoes.todosAtendidos", { total: totalResolvidos })}
          linkLabel={t("operacoes.verResumo")}
          onLinkClick={() => navigate("/atendidos")}
        />
      ) : (
        <CobrancaList
          items={pendentes}
          operadorLat={lat}
          operadorLng={lng}
          onCardClick={handleCardClick}
        />
      )}
    </div>
  )
}
