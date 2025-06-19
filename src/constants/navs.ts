export const NAVS = [
  { to: "/storage", label: "Kho chứa", roles: ["order-emp"] },
  // { to: "/cal", label: "Tính toán" },
  { to: "/calfile", label: "Tính đơn vận", roles: ["order-emp"] },
  { to: "/orders-logs", label: "Lịch sử vận đơn", roles: ["order-emp"] },
  { to: "/accounting-storage", label: "Kho hàng", roles: ["accounting-emp"] },
  {
    to: "/delivered-requests",
    label: "Yêu cầu xuất hàng",
    roles: ["accounting-emp", "order-emp"]
  }
]
