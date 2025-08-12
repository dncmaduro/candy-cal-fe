import { NAVS } from "../../constants/navs"
import { NavButton } from "./NavButton"
import { IconChevronLeft, IconMenu2 } from "@tabler/icons-react"

type SidebarProps = {
  meData: any
  collapsed: boolean
  setCollapsed: (c: (prev: boolean) => boolean) => void
}

export const Sidebar = ({ meData, collapsed, setCollapsed }: SidebarProps) => {
  return (
    <nav
      className={[
        "sticky top-0 z-[201] h-screen border-r border-gray-200 bg-white",
        "flex flex-col shadow-[2px_0_18px_0_rgba(120,120,150,0.06)]",
        "transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-[240px]"
      ].join(" ")}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={[
          "m-3 mb-2 rounded-lg bg-gray-100 p-1.5 hover:bg-gray-200",
          "transition-colors",
          collapsed ? "self-center" : "self-end"
        ].join(" ")}
        aria-label={collapsed ? "Mở menu" : "Thu gọn menu"}
      >
        {collapsed ? <IconMenu2 size={22} /> : <IconChevronLeft size={22} />}
      </button>

      <div className="flex flex-1 flex-col gap-3 px-2">
        {NAVS.filter((n) => {
          if (!meData || (n as any).deprecated) return false
          return meData.role === "admin" || n.roles.includes(meData.role)
        }).map((n) => (
          <NavButton
            key={n.to}
            to={n.to}
            label={n.label}
            iconName={n.icon as any}
            beta={(n as any).beta}
            collapsed={collapsed}
          />
        ))}
      </div>
    </nav>
  )
}
