export type SalesOrderStatus = "draft" | "confirmed" | "official"

export const SALES_ORDER_STATUS_OPTIONS: Array<{
  value: SalesOrderStatus
  label: string
}> = [
  { value: "draft", label: "Báo giá" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "official", label: "Chính thức" }
]

export const getSalesOrderStatusLabel = (status: SalesOrderStatus) => {
  switch (status) {
    case "official":
      return "Chính thức"
    case "confirmed":
      return "Đã xác nhận"
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
    default:
      return "gray"
  }
}
