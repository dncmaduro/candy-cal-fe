export type SalesOrderStatus = "draft" | "confirmed" | "official"|"cancelled"

export const SALES_ORDER_STATUS_OPTIONS: Array<{
  value: SalesOrderStatus
  label: string
}> = [
  { value: "draft", label: "Báo giá" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "official", label: "Chính thức" },
  { value: "cancelled", label: "Đã hủy" }
]

export const getSalesOrderStatusLabel = (status: SalesOrderStatus) => {
  switch (status) {
    case "official":
      return "Chính thức"
    case "confirmed":
      return "Đã xác nhận"
    case "cancelled":
      return "Đã hủy"
    default:
      return "Báo giá"
  }
}

export const getSalesOrderStatusColor = (status: SalesOrderStatus) => {
  switch (status) {
    case "official":
      return "green"
    case "confirmed":
      return "blue"
    case "cancelled":
      return "red"
    default:
      return "gray"
  }
}
