/** @constant */
export const NAVS_URL = "/marketing-storage"
/** @constant */
export const LANDING_NAVS_URL = "/landing"

/** @constant */
export const NAVS = [
  {
    to: `${NAVS_URL}/storage`,
    label: "Kho chứa",
    roles: ["order-emp", "system-emp"],
    icon: "IconBox"
  },
  {
    to: `${NAVS_URL}/calfile`,
    label: "Tính đơn vận",
    roles: ["order-emp", "accounting-emp", "system-emp"],
    icon: "IconCalculator"
  },
  {
    to: `${NAVS_URL}/orders-logs`,
    label: "Lịch sử vận đơn",
    roles: ["order-emp", "system-emp"],
    icon: "IconHistory",
    deprecated: true
  },
  {
    to: `${NAVS_URL}/logs`,
    label: "Lịch sử kho",
    roles: ["admin", "order-emp", "accounting-emp", "system-emp"],
    icon: "IconHistory",
    beta: true
  },
  {
    to: `${NAVS_URL}/accounting-storage`,
    label: "Kho hàng",
    icon: "IconBox",
    roles: ["accounting-emp", "system-emp"]
  },
  {
    to: `${NAVS_URL}/delivered-requests`,
    label: "Yêu cầu xuất hàng",
    icon: "IconTruck",
    roles: ["accounting-emp", "order-emp", "system-emp"]
  },
  {
    to: `${NAVS_URL}/incomes`,
    label: "Doanh thu",
    icon: "IconCoin",
    roles: ["accounting-emp", "order-emp", "system-emp"],
    beta: true
  },
  {
    to: `${NAVS_URL}/system-logs`,
    label: "Lịch sử hệ thống",
    icon: "IconAutomaticGearbox",
    roles: ["admin", "system-emp"],
    beta: true
  },
  {
    to: `${NAVS_URL}/tasks`,
    label: "Công việc",
    icon: "IconClipboardList",
    roles: ["admin"],
    beta: true
  }
]

/** @constant */
export const LANDING_NAVS = [
  {
    to: `${LANDING_NAVS_URL}/landing-page`,
    label: "Trang chủ",
    roles: ["order-emp", "system-emp"]
  }
]
