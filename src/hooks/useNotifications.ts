import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import {
  GetNotificationsRequest,
  GetNotificationsResponse,
  GetUnviewedCountResponse
} from "./models"

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
    return new Audio("/dingdong.mp3").play()
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

  const markAllViewed = async () => {
    return callApi<never, never>({
      path: `/v1/notifications/allviewed`,
      method: "POST",
      token: accessToken
    })
  }

  const getUnviewedCount = async () => {
    return callApi<never, GetUnviewedCountResponse>({
      path: `/v1/notifications/unviewed-count`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    getNotifications,
    playNotificationSound,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    deleteNotification,
    getUnviewedCount,
    markAllViewed
  }
}
