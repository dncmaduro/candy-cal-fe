import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import { GetNotificationsRequest, GetNotificationsResponse } from "./models"
import sound from "../public/dingdong.mp3"

export const useNotifications = () => {
  const { accessToken } = useUserStore()

  const getNotifications = async (req: GetNotificationsRequest) => {
    return callApi<never, GetNotificationsResponse>({
      path: `/v1/notifications?page=${req.page}`,
      method: "GET",
      token: accessToken
    })
  }

  const playNotificationSound = () => {
    return new Audio(sound).play()
  }

  const markAsRead = async (notificationId: string) => {
    return callApi<never, never>({
      path: `/v1/notifications/${notificationId}/read`,
      method: "PATCH",
      token: accessToken
    })
  }

  const markAllAsRead = async () => {
    return callApi<never, never>({
      path: `/v1/notifications/allread`,
      method: "POST",
      token: accessToken
    })
  }

  const markAsUnread = async (notificationId: string) => {
    return callApi<never, never>({
      path: `/v1/notifications/${notificationId}/unread`,
      method: "PATCH",
      token: accessToken
    })
  }

  const deleteNotification = async (notificationId: string) => {
    return callApi<never, never>({
      path: `/v1/notifications/${notificationId}`,
      method: "DELETE",
      token: accessToken
    })
  }

  return {
    getNotifications,
    playNotificationSound,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    deleteNotification
  }
}
