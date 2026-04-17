import { useQuery } from "@tanstack/react-query"
import { ReactNode } from "react"
import { useUsers } from "../../hooks/useUsers"

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
  const { getMe } = useUsers()
  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    select: (data) => data.data
  })
  const userRoles = meData?.roles

  if (!roles || roles.length === 0) return <>{children}</>

  const has = userRoles ? roles.some((role) => userRoles.includes(role)) : false
  const pass = not ? !has : has

  if (!pass) return <>{fallback}</>
  return <>{children}</>
}
