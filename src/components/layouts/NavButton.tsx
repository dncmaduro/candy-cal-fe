import { Link } from "@tanstack/react-router"
import * as TablerIcons from "@tabler/icons-react"
import { ReactNode } from "react"
import { useMediaQuery } from "@mantine/hooks"

interface Props {
  to: string
  label: string
  // Support both dynamic icon name and direct ReactNode for backward compatibility
  iconName?: keyof typeof TablerIcons | string
  icon?: ReactNode
  beta?: boolean
  collapsed?: boolean
}

export const NavButton = ({
  to,
  label,
  iconName,
  icon,
  beta,
  collapsed
}: Props) => {
  const pathname = window.location.pathname
  const active = pathname === to
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Resolve icon component from Tabler by name if provided
  let ResolvedIcon: ReactNode = null
  if (iconName && typeof iconName === "string") {
    const Cmp =
      (TablerIcons as any)[iconName] ||
      (TablerIcons as any)["IconSquareRounded"]
    if (Cmp) ResolvedIcon = <Cmp size={isMobile ? 14 : 20} />
  }

  const baseClasses = [
    "flex items-center gap-2 rounded-xl transition-colors duration-150",
    "text-gray-600 hover:text-gray-900",
    active ? "bg-indigo-50 text-indigo-700 shadow-sm" : "hover:bg-gray-50",
    collapsed
      ? "justify-center w-12 h-12 p-0"
      : "justify-start w-full px-3 py-2"
  ].join(" ")

  return (
    <Link to={to} title={collapsed ? label : undefined} className={baseClasses}>
      {/* Icon */}
      <span
        className={
          collapsed
            ? "flex items-center justify-center"
            : "flex items-center justify-center"
        }
      >
        {icon ?? ResolvedIcon}
      </span>

      {/* Label + Beta (hidden when collapsed) */}
      {!collapsed && (
        <span className="flex items-center gap-2">
          <span className="text-xs font-medium md:text-sm">{label}</span>
          {beta && (
            <span className="inline-flex items-center rounded-full border border-red-300 px-2 py-0.5 text-[10px] font-semibold text-red-600">
              Beta
            </span>
          )}
        </span>
      )}
    </Link>
  )
}
