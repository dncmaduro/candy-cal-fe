import { Box, Group } from "@mantine/core"
import { useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useUserStore } from "../../store/userStore"
import { useUsers } from "../../hooks/useUsers"
import { saveToCookies } from "../../store/cookies"
import { CToast } from "../common/CToast"

interface Props {
  sidebar: React.ReactNode
  content: React.ReactNode
}

export function MessagesLayout({ sidebar, content }: Props) {
  const { accessToken, setUser, clearUser } = useUserStore()
  const { checkToken, getNewToken } = useUsers()
  const navigate = useNavigate()

  const { mutate: getToken } = useMutation({
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
    queryKey: ["validateToken"],
    queryFn: checkToken,
    select: (data) => data.data.valid,
    refetchInterval: 1000 * 30 // 30s
  })

  useEffect(() => {
    if (!isTokenValid) {
      getToken()
    }
  }, [isTokenValid])

  useEffect(() => {
    if (!accessToken) {
      navigate({ to: "/" })
    }
  }, [accessToken])

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
