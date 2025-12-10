/** @constant */
export const NAVS_URL = "/marketing-storage"
/** @constant */
export const LANDING_NAVS_URL = "/landing"
/** @constant */
export const LIVESTREAM_NAVS_URL = "/livestream"
/** @constant */
export const SALES_NAVS_URL = "/sales"
/** @constant */
export const ADMIN_NAVS_URL = "/admin"

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
    icon: "IconCalculator",
    deprecated: true,
    redirectTo: `${NAVS_URL}/storage`
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
    icon: "IconHistory"
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
    roles: ["accounting-emp", "order-emp", "system-emp"]
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

/** @constant */
export const LIVESTREAM_NAVS = [
  {
    to: `${LIVESTREAM_NAVS_URL}/calendar`,
    label: "Lịch livestream",
    roles: ["admin", "livestream-leader", "livestream-emp", "system-emp"],
    icon: "IconCalendar"
  },
  {
    to: `${LIVESTREAM_NAVS_URL}/members`,
    label: "Nhân sự",
    roles: ["admin", "livestream-leader", "system-emp"],
    icon: "IconUsers"
  },
  {
    to: `${LIVESTREAM_NAVS_URL}/periods`,
    label: "Kỳ livestream",
    roles: ["admin", "livestream-leader", "system-emp"],
    icon: "IconClock"
  },
  {
    to: `${LIVESTREAM_NAVS_URL}/reports`,
    label: "Báo cáo",
    roles: ["admin", "livestream-leader", "accounting-emp", "system-emp"],
    icon: "IconReportAnalytics"
  },
  {
    to: `${LIVESTREAM_NAVS_URL}/stats`,
    label: "Chỉ số",
    roles: ["admin", "livestream-leader", "accounting-emp", "system-emp"],
    icon: "IconChartBar"
  },
  {
    to: `${LIVESTREAM_NAVS_URL}/goals`,
    label: "Mục tiêu",
    roles: ["admin", "livestream-leader", "accounting-emp", "system-emp"],
    icon: "IconTarget"
  },
  {
    to: `${LIVESTREAM_NAVS_URL}/channels`,
    label: "Kênh livestream",
    roles: ["admin", "livestream-leader", "system-emp"],
    icon: "IconAt"
  }
]

/** @constant */
export const SALES_NAVS = [
  {
    to: `${SALES_NAVS_URL}/funnel`,
    label: "Funnel khách",
    roles: ["admin", "sales-emp", "system-emp"],
    icon: "IconChartFunnel"
  },
  {
    to: `${SALES_NAVS_URL}/tasks`,
    label: "Công việc",
    roles: ["admin", "sales-leader", "system-emp"],
    icon: "IconChecklist"
  },
  {
    to: `${SALES_NAVS_URL}/orders`,
    label: "Đơn hàng",
    roles: ["admin", "sales-emp", "system-emp"],
    icon: "IconClipboardList"
  },
  {
    to: `${SALES_NAVS_URL}/channels`,
    label: "Kênh bán hàng",
    roles: ["admin", "sales-emp", "system-emp"],
    icon: "IconAt"
  },
  {
    to: `${SALES_NAVS_URL}/items`,
    label: "Mặt hàng",
    roles: ["admin", "sales-emp", "system-emp"],
    icon: "IconPackage"
  },
  {
    to: `${SALES_NAVS_URL}/dashboard`,
    label: "Chỉ số",
    roles: ["admin", "sales-leader", "system-emp"],
    icon: "IconChartBar"
  },
  {
    to: `${SALES_NAVS_URL}/daily-reports`,
    label: "Báo cáo hàng ngày",
    roles: ["admin", "sales-leader", "sales-emp", "system-emp"],
    icon: "IconReportAnalytics"
  },
  {
    to: `${SALES_NAVS_URL}/customer-ranks`,
    label: "Hạng khách hàng",
    roles: ["admin", "sales-emp", "system-emp"],
    icon: "IconDeviceTabletStar"
  }
]

/** @constant */
export const ADMIN_NAVS = [
  {
    to: `${ADMIN_NAVS_URL}/users`,
    label: "Quản lý người dùng",
    roles: ["admin"],
    icon: "IconUsers"
  },
  {
    to: `${NAVS_URL}/system-logs`,
    label: "Lịch sử hệ thống",
    icon: "IconAutomaticGearbox",
    roles: ["admin"]
  },
  {
    to: `${NAVS_URL}/tasks`,
    label: "Công việc",
    icon: "IconClipboardList",
    roles: ["admin"],
    beta: true
  }
]
