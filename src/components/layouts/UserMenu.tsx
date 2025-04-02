import { Button } from "@mantine/core"
import { IconPower } from "@tabler/icons-react"
import { useUserStore } from "../../store/userStore"

export const UserMenu = () => {
  const { clearUser } = useUserStore()

  return (
    <Button
      leftSection={<IconPower />}
      variant="subtle"
      radius={"md"}
      color="red"
      onClick={clearUser}
    >
      Đăng xuất
    </Button>
  )
}
