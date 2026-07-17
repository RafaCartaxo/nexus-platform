import { useContext } from "react"
import { FeedbackContext } from "./FeedbackProvider.js"

export function useFeedback() {
  const ctx = useContext(FeedbackContext)

  if (!ctx) {
    throw new Error("useFeedback must be used within a FeedbackProvider")
  }

  return ctx
}
