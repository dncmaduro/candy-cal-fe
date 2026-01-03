import { Box, Flex, Text, Badge, Group, Menu, ActionIcon } from "@mantine/core"
import {
  IconCircleDotFilled,
  IconLink,
  IconDotsVertical,
  IconTrash,
  IconCircleDashed
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Notification } from "../../hooks/models"
import { Link } from "@tanstack/react-router"
import { useNotifications } from "../../hooks/useNotifications"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useMediaQuery } from "@mantine/hooks"

interface Props {
  notification: Notification
}

export const NotificationItem = ({ notification }: Props) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { markAsRead, markAsUnread, deleteNotification } = useNotifications()
  const queryClient = useQueryClient()
  const [menuOpened, setMenuOpened] = useState(false)

  const { mutate: read } = useMutation({
    mutationFn: () => markAsRead(notification._id),
    onSuccess: () => {
      queryClient.setQueryData(["getNotifications"], (oldData: any) => ({
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          data: {
            ...page.data,
            notifications: page.data.notifications.map((noti: any) =>
              noti._id === notification._id ? { ...noti, read: true } : noti
            )
          }
        }))
      }))
    }
  })

  const { mutate: unread } = useMutation({
    mutationFn: () => markAsUnread(notification._id),
    onSuccess: () => {
      queryClient.setQueryData(["getNotifications"], (oldData: any) => ({
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          data: {
            ...page.data,
            notifications: page.data.notifications.map((noti: any) =>
              noti._id === notification._id ? { ...noti, read: false } : noti
            )
          }
        }))
      }))
    }
  })

  const { mutate: remove } = useMutation({
    mutationFn: () => deleteNotification(notification._id),
    onSuccess: () => {
      queryClient.setQueryData(["getNotifications"], (oldData: any) => ({
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          data: {
            ...page.data,
            notifications: page.data.notifications.filter(
              (noti: any) => noti._id !== notification._id
            )
          }
        }))
      }))
    }
  })

  const handleClick = () => {
    if (!notification.read) read()
  }

  const content = (
    <Box
      px={isMobile ? 12 : 16}
      py={isMobile ? 8 : 12}
      bg={notification.read ? "#f8fafc" : "indigo.0"}
      style={{
        borderRadius: 12,
        cursor: notification.link ? "pointer" : "default",
        transition: "background 0.15s, box-shadow 0.18s",
        position: "relative",
        boxShadow: notification.read
          ? undefined
          : "0 2px 12px 0 rgba(60,80,180,0.06)"
      }}
      my={2}
      tabIndex={0}
      onClick={handleClick}
      className="hover:bg-indigo-50 focus:bg-indigo-50 active:bg-indigo-100"
    >
      <Flex gap={12} align="flex-start">
        {/* Dot nếu chưa đọc */}
        {!notification.read ? (
          <IconCircleDotFilled
            color="#6366f1"
            size={isMobile ? 12 : 16}
            style={{ marginTop: isMobile ? 4 : 2, flexShrink: 0 }}
          />
        ) : (
          <IconCircleDashed
            color="#cbd5e1"
            size={isMobile ? 12 : 16}
            style={{ marginTop: isMobile ? 4 : 2, flexShrink: 0 }}
          />
        )}
        <Box style={{ flex: 1 }}>
          <Group align="center" gap={8}>
            <Text
              fw={600}
              fz={isMobile ? "13" : "sm"}
              truncate="end"
              style={{ flex: 1 }}
            >
              {notification.title}
            </Text>
            <Badge
              color={notification.type === "system" ? "gray" : "indigo"}
              size="xs"
              variant={notification.type === "system" ? "light" : "filled"}
            >
              {notification.type === "system" ? "Hệ thống" : "Thông báo"}
            </Badge>
          </Group>
          <Text
            fz={isMobile ? "xs" : "sm"}
            c="dimmed"
            mt={4}
            mb={4}
            lineClamp={2}
          >
            {notification.content}
          </Text>
          <Flex align="center" gap={8}>
            <Text fz={isMobile ? "10" : "xs"} c="gray.7">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: vi
              })}
            </Text>
            {notification.link && (
              <IconLink size={14} color="#6366f1" style={{ opacity: 0.65 }} />
            )}
          </Flex>
        </Box>
        {/* Menu tuỳ chọn */}
        <Menu
          position="bottom-end"
          offset={isMobile ? 2 : 4}
          opened={menuOpened}
          onChange={setMenuOpened}
        >
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size={isMobile ? "xs" : "sm"}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setMenuOpened((v) => !v)
              }}
              aria-label="Tuỳ chọn"
            >
              <IconDotsVertical size={isMobile ? 14 : 18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {!notification.read && (
              <Menu.Item
                leftSection={<IconCircleDotFilled size={14} color="#6366f1" />}
                onClick={() => read()}
                fz={isMobile ? "11" : "sm"}
              >
                Đánh dấu đã đọc
              </Menu.Item>
            )}
            {notification.read && (
              <Menu.Item
                leftSection={<IconCircleDashed size={14} color="#94a3b8" />}
                onClick={() => unread()}
                fz={isMobile ? "11" : "sm"}
              >
                Đánh dấu chưa đọc
              </Menu.Item>
            )}
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={() => remove()}
              fz={isMobile ? "11" : "sm"}
            >
              Xoá thông báo
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>
    </Box>
  )

  if (notification.link) {
    return (
      <Link to={notification.link} tabIndex={-1} style={{ display: "block" }}>
        {content}
      </Link>
    )
  }
  return content
}
