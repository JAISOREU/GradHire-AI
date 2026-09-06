import * as React from "react"
import { cn } from '../../lib/utils'

interface DropdownMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

const DropdownMenuContext = React.createContext<{
  onClose: () => void
} | null>(null)

const useDropdownMenu = () => {
  const ctx = React.useContext(DropdownMenuContext)
  if (!ctx) throw new Error("DropdownMenu components must be used within DropdownMenu")
  return ctx
}

const DropdownMenu = ({ open, onOpenChange, children }: DropdownMenuProps) => {
  const onClose = React.useCallback(() => onOpenChange(false), [onOpenChange])

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEsc)
    }
    return () => document.removeEventListener("keydown", handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <DropdownMenuContext.Provider value={{ onClose }}>
      <button
        type="button"
        className="fixed inset-0 z-50 border-none cursor-pointer"
        onClick={onClose}
        aria-label="Close menu"
      >
        <span className="sr-only">Close menu</span>
      </button>
      <div
        role="menu"
        className={cn(
          "absolute rounded-md border border-border bg-surface shadow-md",
          "min-w-[8rem] overflow-hidden"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { onSelect?: () => void }>(
  ({ className, onSelect, ...props }, ref) => {
    const { onClose } = useDropdownMenu()
    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={0}
        className={cn(
          "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground",
          className
        )}
        onClick={() => {
          onSelect?.()
          onClose()
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSelect?.()
            onClose()
          }
        }}
        {...props}
      />
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = ({ className }: { className?: string }) => (
  <div className={cn("mx-1 my-1 h-px bg-border", className)} />
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator }
