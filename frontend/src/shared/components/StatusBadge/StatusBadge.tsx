import { type HTMLAttributes } from "react"

type Variant = "success" | "warning" | "danger" | "info" | "neutral"
type Size = "sm" | "md"

const variantStyles: Record<Variant, string> = {
  success: "bg-success-light text-success-text",
  warning: "bg-warning-light text-warning-text",
  danger: "bg-danger-light text-danger-text",
  info: "bg-info-light text-info-text",
  neutral: "bg-surface-secondary text-text-secondary",
}

const sizeStyles: Record<Size, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
}

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: Variant
  label: string
  size?: Size
}

export function StatusBadge({ variant, label, size = "sm", className = "", ...props }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full font-medium ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {label}
    </span>
  )
}
