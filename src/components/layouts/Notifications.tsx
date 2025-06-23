import { ActionIcon, Popover } from "@mantine/core"
import { IconBell } from "@tabler/icons-react"
import { useUsers } from "../../hooks/useUsers"
import { useQuery } from "@tanstack/react-query"
import { Notification } from "../../hooks/models"
import { CToast } from "../common/CToast"
import { useSocket } from "../../hooks/useSocket"
import { useNavigate } from "@tanstack/react-router"
import { NotificationBox } from "../notifications/NotificationBox"

export const Notifications = () => {
  const { getMe } = useUsers()
  const navigate = useNavigate()

  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: () => getMe(),
    select: (data) => data.data
  })

  const handleNoti = (noti: Notification) => {
    CToast.info({
      id: `noti-${noti._id}`,
      title: noti.title,
      subtitle: noti.content,
      onClick: () => {
        if (noti.link) {
          navigate({ to: noti.link })
        }
        CToast.hide(`noti-${noti._id}`)
      }
    })
  }
  useSocket(handleNoti, meData?._id || "")

  return (
    <Popover>
      <Popover.Target>
        <ActionIcon variant="subtle" radius={"xl"}>
          <IconBell />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown>
        <NotificationBox />
      </Popover.Dropdown>
    </Popover>
  )
}
