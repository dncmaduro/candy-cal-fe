import { notifications } from "@mantine/notifications"

type ToastType = {
  title: string
  subtitle?: string
}

export const CToast = {
  success: (toast: ToastType) => {
    notifications.show({
      title: toast.title,
      message: toast.subtitle ?? "",
      color: "green"
    })
  },

  error: (toast: ToastType) => {
    notifications.show({
      title: toast.title,
      message: toast.subtitle ?? "",
      color: "red"
    })
  }
}
