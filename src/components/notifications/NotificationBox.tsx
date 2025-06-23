import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query"
import { useEffect, useMemo, useRef } from "react"
import { useNotifications } from "../../hooks/useNotifications"
import {
  Box,
  Button,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text
} from "@mantine/core"
import { NotificationItem } from "./NotificationItem"

export const NotificationBox = () => {
  const { getNotifications, markAllAsRead } = useNotifications()
  const queryClient = useQueryClient()

  const { mutate: readAll } = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData(["getNotifications"], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              notifications: page.data.notifications.map((noti: any) => ({
                ...noti,
                read: true
              }))
            }
          }))
        }
      })
    }
  })

  const {
    data: notificationsData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: ["getNotifications"],
    queryFn: ({ pageParam = 1 }) => getNotifications({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.hasMore) {
        return allPages.length + 1
      }
    },
    refetchOnMount: false,
    select: (data) => ({
      notifications: data.pages.map((page) => page.data.notifications).flat()
    })
  })

  const notifications = useMemo(
    () => notificationsData?.notifications,
    [notificationsData]
  )

  const loaderRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!loaderRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(loaderRef.current)

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <Box>
      <Group justify="space-between" align="center" mb={6} px={4}>
        <Text fw={700} fz="md">
          Thông báo
        </Text>
        <Button
          size="xs"
          variant="subtle"
          color="indigo"
          onClick={() => readAll()}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </Group>
      <ScrollArea.Autosize w={380} mah={600}>
        <Stack>
          {notifications?.map((noti) => (
            <NotificationItem key={noti._id} notification={noti} />
          ))}
          {(hasNextPage || isFetchingNextPage) && (
            <Skeleton
              ref={loaderRef}
              h={48}
              radius="md"
              my={8}
              visible={isFetchingNextPage || hasNextPage}
            />
          )}
          {!hasNextPage && notifications && notifications.length > 0 && (
            <Text ta="center" c="gray" my={8} fz="xs">
              Đã hiển thị tất cả thông báo
            </Text>
          )}
        </Stack>
      </ScrollArea.Autosize>
    </Box>
  )
}
