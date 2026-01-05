"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

interface UnifiedListRowProps {
  title: string
  subtitle: string
  showCheckbox?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  action?: React.ReactNode
  className?: string
  onClick?: () => void
}

function UnifiedListRow({
  title,
  subtitle,
  showCheckbox = false,
  checked = false,
  onCheckedChange,
  disabled = false,
  action,
  className,
  onClick,
}: UnifiedListRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-5 border-b last:border-b-0 transition-colors",
        disabled
          ? "opacity-60"
          : "hover:bg-muted/30 cursor-pointer",
        className
      )}
      style={{ borderColor: "var(--border)" }}
      onClick={onClick}
    >
      <div className={cn("flex items-center flex-1 min-w-0", showCheckbox && "gap-4")}>
        {showCheckbox && (
          <Checkbox
            checked={checked}
            onCheckedChange={onCheckedChange}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <div className="flex-1 min-w-0">
          <h3
            className={cn("font-semibold text-[15px] mb-1", disabled && "line-through")}
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        </div>
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  )
}

interface UnifiedListProps {
  children: React.ReactNode
  className?: string
}

function UnifiedList({ children, className }: UnifiedListProps) {
  return (
    <div
      className={cn("border rounded-lg overflow-hidden", className)}
      style={{ borderColor: "var(--border)" }}
    >
      {children}
    </div>
  )
}

export { UnifiedList, UnifiedListRow }
export type { UnifiedListProps, UnifiedListRowProps }
