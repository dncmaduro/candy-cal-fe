import { useQuery } from "@tanstack/react-query"
import { ReactNode } from "react"
import { useUsers } from "../../hooks/useUsers"

interface CanProps {
  permissions?: string[]
  /** If true, render children when user does not have any listed permission */
  not?: boolean
  /** Fallback to render when permission check fails */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Permission based conditional rendering helper.
 * Usage:
 * <Can permissions={["api.storageitems.create-item"]}>...content...</Can>
 * <Can permissions={["api.storageitems.delete-item"]} not fallback={null}>...content...</Can>
 */
export const Can = ({
  permissions,
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
  const userPermissions = meData?.permissions || []

  if (!permissions || permissions.length === 0) return <>{children}</>

  const has = permissions.some((permission) => userPermissions.includes(permission))
  const pass = not ? !has : has

  if (!pass) return <>{fallback}</>
  return <>{children}</>
}
