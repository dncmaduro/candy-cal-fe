import { ActionIcon, Indicator, Popover } from "@mantine/core"
import { IconBell } from "@tabler/icons-react"
import { useUsers } from "../../hooks/useUsers"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Notification } from "../../hooks/models"
import { CToast } from "../common/CToast"
import { useSocket } from "../../hooks/useSocket"
import { useNavigate } from "@tanstack/react-router"
import { NotificationBox } from "../notifications/NotificationBox"
import { useNotifications } from "../../hooks/useNotifications"

export const Notifications = () => {
  const { getMe } = useUsers()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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

  const { markAllViewed, getUnviewedCount } = useNotifications()

  const { data: unviewedCountData } = useQuery({
    queryKey: ["getUnviewedCount"],
    queryFn: () => getUnviewedCount(),
    select: (data) => data.data.count
  })

  const { mutate: viewAll } = useMutation({
    mutationFn: markAllViewed,
    onSuccess: () => {
      queryClient.setQueryData(["getUnviewedCount"], { data: { count: 0 } })
    }
  })

  return (
    <Popover onOpen={() => viewAll()}>
      <Popover.Target>
        <Indicator
          inline
          size={14}
          color="red"
          offset={4}
          label={
            unviewedCountData
              ? unviewedCountData > 9
                ? "9+"
                : unviewedCountData
              : ""
          }
          disabled={unviewedCountData === 0}
        >
          <ActionIcon variant="subtle" size={"lg"} radius={"xl"}>
            <IconBell />
          </ActionIcon>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown>
        <NotificationBox />
      </Popover.Dropdown>
    </Popover>
  )
}
