import { Loader2, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"

export type FeedbackStatus = "hidden" | "loading" | "success" | "error" | "warning" | "info"

interface FeedbackOverlayProps {
  status: FeedbackStatus
  message: string
}

const statusConfig: Record<Exclude<FeedbackStatus, "hidden">, { bg: string; icon: typeof Loader2; text: string }> = {
  loading: { bg: "bg-blue-600", icon: Loader2, text: "text-white" },
  success: { bg: "bg-green-600", icon: CheckCircle2, text: "text-white" },
  error:   { bg: "bg-red-600", icon: AlertCircle, text: "text-white" },
  warning: { bg: "bg-yellow-500", icon: AlertTriangle, text: "text-white" },
  info:    { bg: "bg-blue-500", icon: Info, text: "text-white" },
}

export function FeedbackOverlay({ status, message }: FeedbackOverlayProps) {
  if (status === "hidden") return null

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium shadow-sm ${config.bg} ${config.text} transition-all duration-300`}>
      <Icon className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
      <span>{message}</span>
    </div>
  )
}
