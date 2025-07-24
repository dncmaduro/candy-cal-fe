export const NAVS_URL = "/marketing-storage"
export const LANDING_NAVS_URL = "/landing"

export const NAVS = [
  { to: `${NAVS_URL}/storage`, label: "Kho chứa", roles: ["order-emp"] },
  // { to: "/cal", label: "Tính toán" },
  {
    to: `${NAVS_URL}/calfile`,
    label: "Tính đơn vận",
    roles: ["order-emp", "accounting-emp"]
  },
  {
    to: `${NAVS_URL}/orders-logs`,
    label: "Lịch sử vận đơn",
    roles: ["order-emp"]
  },
  {
    to: `${NAVS_URL}/accounting-storage`,
    label: "Kho hàng",
    roles: ["accounting-emp"]
  },
  {
    to: `${NAVS_URL}/delivered-requests`,
    label: "Yêu cầu xuất hàng",
    roles: ["accounting-emp", "order-emp"]
  },
  {
    to: `${NAVS_URL}/incomes`,
    label: "Doanh thu",
    roles: ["accounting-emp", "order-emp"]
  }
]

export const LANDING_NAVS = [
  {
    to: `${LANDING_NAVS_URL}/landing-page`,
    label: "Trang chủ",
    roles: ["order-emp"]
  }
]
