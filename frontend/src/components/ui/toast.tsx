import * as React from "react"
import { X } from "lucide-react"
import { cn } from '../../lib/utils'

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

const ToastContext = React.createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
} | null>(null)

const TOAST_COLORS: Record<ToastType, { bg: string; text: string; border: string }> = {
  success: { bg: "bg-success-soft", text: "text-success", border: "border-success" },
  error: { bg: "bg-danger-soft", text: "text-danger", border: "border-danger" },
  warning: { bg: "bg-warning-soft", text: "text-warning", border: "border-warning" },
  info: { bg: "bg-info-soft", text: "text-info", border: "border-info" },
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`
    const duration = toast.duration ?? 4000
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => removeToast(id), duration)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 rounded-md border px-4 py-3 shadow-md",
              "min-w-[300px] max-w-sm",
              TOAST_COLORS[toast.type].bg,
              TOAST_COLORS[toast.type].border,
              TOAST_COLORS[toast.type].text
            )}
            role="alert"
          >
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
