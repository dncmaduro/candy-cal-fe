import { notifications } from "@mantine/notifications"
import { ReactNode } from "react"

type ToastType = {
  title: string
  subtitle?: ReactNode
  onClick?: () => void
  id?: string
}

export const CToast = {
  success: (toast: ToastType) => {
    notifications.show({
      id: toast.id,
      title: toast.title,
      message: toast.subtitle ?? "",
      color: "green",
      position: "top-right",
      onClick: toast.onClick,
      className: `${toast.onClick && "cursor-pointer"}`
    })
  },

  error: (toast: ToastType) => {
    notifications.show({
      id: toast.id,
      title: toast.title,
      message: toast.subtitle ?? "",
      color: "red",
      position: "top-right",
      onClick: toast.onClick,
      className: `${toast.onClick && "cursor-pointer"}`
    })
  },

  info: (toast: ToastType) => {
    notifications.show({
      id: toast.id,
      title: toast.title,
      message: toast.subtitle ?? "",
      color: "blue",
      position: "top-right",
      onClick: toast.onClick,
      className: `${toast.onClick && "cursor-pointer"}`
    })
  },

  hide: (id: string) => {
    notifications.hide(id)
  }
}
