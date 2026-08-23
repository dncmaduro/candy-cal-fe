import { Box, Group } from "@mantine/core"
import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useUserStore } from "../../store/userStore"
import { useUsers } from "../../hooks/useUsers"
import { saveToCookies } from "../../store/cookies"
import { CToast } from "../common/CToast"
import { SALES_ACCESS_PERMISSIONS } from "../../constants/navs"
import { useAuthGuard } from "../../hooks/useAuthGuard"
import { useSalesRouteAccess } from "../../hooks/useSalesRouteAccess"

interface Props {
  sidebar: React.ReactNode
  content: React.ReactNode
}

export function MessagesLayout({ sidebar, content }: Props) {
  const { meData } = useAuthGuard(SALES_ACCESS_PERMISSIONS)
  useSalesRouteAccess(meData?.permissions)
  const { accessToken, setUser, clearUser } = useUserStore()
  const { checkToken, getNewToken } = useUsers()
  const navigate = useNavigate()
  const refreshAttemptedRef = useRef(false)

  const { mutate: getToken, isPending: isRefreshing } = useMutation({
    mutationKey: ["getNewToken"],
    mutationFn: getNewToken,
    onSuccess: (response) => {
      setUser(response.data.accessToken)
      saveToCookies("refreshToken", response.data.refreshToken)
    },
    onError: () => {
      navigate({ to: "/" })
      clearUser()
      saveToCookies("refreshToken", "")
      CToast.error({
        title: "Vui lòng đăng nhập lại!"
      })
    }
  })

  const { data: isTokenValid } = useQuery({
    queryKey: ["validateToken", accessToken],
    queryFn: checkToken,
    enabled: !!accessToken,
    select: (data) => data.data.valid,
    refetchInterval: 1000 * 30 // 30s
  })

  useEffect(() => {
    if (isTokenValid === true) {
      refreshAttemptedRef.current = false
      return
    }

    if (
      isTokenValid === false &&
      !isRefreshing &&
      !refreshAttemptedRef.current
    ) {
      refreshAttemptedRef.current = true
      getToken()
    }
  }, [getToken, isRefreshing, isTokenValid])

  useEffect(() => {
    if (!accessToken) {
      navigate({ to: "/" })
    }
  }, [accessToken, navigate])

  return (
    <Box
      mx="auto"
      w="100%"
      h={"100vh"}
      px={{ base: 0, md: 0 }}
      style={{
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        border: "1px solid #eee",
        marginTop: "-400px!important"
      }}
    >
      <Group align="stretch" gap={0} style={{ height: "100vh" }}>
        {/* Left sidebar */}
        <Box
          style={{
            width: 360,
            borderRight: "1px solid #f0f0f0",
            background: "#fafbfc"
          }}
        >
          {sidebar}
        </Box>

        {/* Right content */}
        <Box style={{ flex: 1, position: "relative" }}>{content}</Box>
      </Group>
    </Box>
  )
}
