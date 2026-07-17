import { createContext, useCallback, useRef, useState, type ReactNode } from "react"
import { FeedbackOverlay, type FeedbackStatus } from "./FeedbackOverlay.js"

interface FeedbackState {
  status: FeedbackStatus
  message: string
}

interface RunOptions {
  loading: string
  success: string
  error: string
  action: () => Promise<void>
}

interface FeedbackContextValue {
  show: (state: FeedbackState) => void
  dismiss: () => void
  run: (options: RunOptions) => Promise<void>
  status: FeedbackStatus
  message: string
}

export const FeedbackContext = createContext<FeedbackContextValue | null>(null)

const MINIMUM_LOADING_MS = 600
const SUCCESS_DURATION_MS = 1200
const ERROR_DURATION_MS = 4000

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [{ status, message }, setState] = useState<FeedbackState>({ status: "hidden", message: "" })
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const scheduleDismiss = useCallback((duration: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setState({ status: "hidden", message: "" })
    }, duration)
  }, [])

  const show = useCallback((state: FeedbackState) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setState(state)
    if (state.status === "success") scheduleDismiss(SUCCESS_DURATION_MS)
    else if (state.status === "error") scheduleDismiss(ERROR_DURATION_MS)
  }, [scheduleDismiss])

  const dismiss = useCallback(() => {
    setState({ status: "hidden", message: "" })
  }, [])

  const run = useCallback(async ({ loading, success, error, action }: RunOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current)

    const loadingStart = Date.now()
    setState({ status: "loading", message: loading })

    try {
      await action()

      const elapsed = Date.now() - loadingStart
      const remaining = Math.max(0, MINIMUM_LOADING_MS - elapsed)

      setTimeout(() => {
        setState({ status: "success", message: success })
        scheduleDismiss(SUCCESS_DURATION_MS)
      }, remaining)
    } catch (err) {
      const msg = err instanceof Error ? err.message : error
      const elapsed = Date.now() - loadingStart
      const remaining = Math.max(0, MINIMUM_LOADING_MS - elapsed)

      setTimeout(() => {
        setState({ status: "error", message: msg })
        scheduleDismiss(ERROR_DURATION_MS)
      }, remaining)
    }
  }, [scheduleDismiss])

  return (
    <FeedbackContext.Provider value={{ show, dismiss, run, status, message }}>
      {children}
      <FeedbackOverlay status={status} message={message} />
    </FeedbackContext.Provider>
  )
}
