import { ReactNode } from "react"
import { useMe } from "../../context/MeContext"

interface CanProps {
  roles?: string[]
  /** If true, render children when user role is NOT in roles */
  not?: boolean
  /** Fallback to render when permission check fails */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Role based conditional rendering helper.
 * Usage:
 * <Can roles={["admin","accounting-emp"]}>...content...</Can>
 * <Can roles={["guest"]} not fallback={null}>...content...</Can>
 */
export const Can = ({
  roles,
  not = false,
  fallback = null,
  children
}: CanProps) => {
  const me = useMe()
  const userRoles = me?.roles

  if (!roles || roles.length === 0) return <>{children}</>

  const has = userRoles ? roles.some((role) => userRoles.includes(role)) : false
  const pass = not ? !has : has

  if (!pass) return <>{fallback}</>
  return <>{children}</>
}
