export type AppNavItem = {
  to: string
  label: string
  roles: string[]
  icon?: string
  deprecated?: boolean
  redirectTo?: string
  beta?: boolean
}

/** @constant */
export const NAVS_URL = "/marketing-storage"
/** @constant */
export const WAREHOUSE_NAVS_URL = "/kho-van"
/** @constant */
export const TIKTOKSHOP_NAVS_URL = "/tiktokshop"
/** @constant */
export const SHOPEE_NAVS_URL = "/shopee"
/** @constant */
export const LANDING_NAVS_URL = "/landing"
/** @constant */
export const LIVESTREAM_NAVS_URL = "/livestream"
/** @constant */
export const SALES_NAVS_URL = "/sales"
/** @constant */
export const ADMIN_NAVS_URL = "/admin"

/** @constant */
export const WAREHOUSE_NAVS: AppNavItem[] = [
  {
    to: `${WAREHOUSE_NAVS_URL}/accounting-storage`,
    label: "Kho hàng",
    icon: "IconBox",
    roles: ["admin", "accounting-emp", "system-emp"]
  },
  {
    to: `${WAREHOUSE_NAVS_URL}/logs`,
    label: "Lịch sử kho",
    roles: ["admin", "accounting-emp", "system-emp"],
    icon: "IconHistory"
  },
  {
    to: `${WAREHOUSE_NAVS_URL}/delivered-requests`,
    label: "Yêu cầu xuất hàng",
    icon: "IconTruck",
    roles: ["admin", "accounting-emp", "system-emp"]
  },
  {
    to: `${WAREHOUSE_NAVS_URL}/incomes`,
    label: "Doanh thu",
    icon: "IconCoin",
    roles: ["admin", "accounting-emp", "system-emp"]
  }
]

/** @constant */
export const TIKTOKSHOP_NAVS: AppNavItem[] = [
  {
    to: `${TIKTOKSHOP_NAVS_URL}/sku`,
    label: "SKU",
    roles: ["admin", "order-emp", "system-emp"],
    icon: "IconBox"
  },
  {
    to: `${TIKTOKSHOP_NAVS_URL}/incomes`,
    label: "Doanh thu",
    icon: "IconCoin",
    roles: ["admin", "order-emp", "system-emp"]
  }
]

/** @constant */
export const SHOPEE_NAVS: AppNavItem[] = [
  {
    to: `${SHOPEE_NAVS_URL}/sku`,
    label: "SKU",
    roles: ["admin", "shopee-emp", "system-emp"],
    icon: "IconBox"
  },
  {
    to: `${SHOPEE_NAVS_URL}/incomes`,
    label: "Doanh thu",
    icon: "IconCoin",
    roles: ["admin", "shopee-emp", "system-emp"]
  }
]

/** @constant */
export const NAVS = WAREHOUSE_NAVS

/** @constant */
export const LANDING_NAVS: AppNavItem[] = [
  {
    to: `${LANDING_NAVS_URL}/landing-page`,
    label: "Trang chủ",
    roles: ["order-emp", "system-emp"]
  }
]

/** @constant */
export const LIVESTREAM_NAVS: AppNavItem[] = [
  {
    to: `${LIVESTREAM_NAVS_URL}/calendar`,
    label: "Lịch livestream",
    roles: [
      "admin",
      "livestream-leader",
      "livestream-emp",
      "livestream-ast",
      "system-emp",
      "livestream-accounting"
    ],
    icon: "IconCalendar"
  },
  // {
  //   to: `${LIVESTREAM_NAVS_URL}/members`,
  //   label: "Nhân sự",
  //   roles: ["admin", "livestream-leader", "system-emp"],
  //   icon: "IconUsers"
  // },
  {
    to: `${LIVESTREAM_NAVS_URL}/periods`,
    label: "Ca livestream",
    roles: ["admin", "livestream-leader", "system-emp"],
    icon: "IconClock"
  },
  {
    to: `${LIVESTREAM_NAVS_URL}/reports`,
    label: "Báo cáo",
    roles: [
      "admin",
      "livestream-leader",
      "livestream-emp",
      "livestream-ast",
      "system-emp",
      "livestream-accounting"
    ],
    icon: "IconReportAnalytics"
  },
  {
    to: `${LIVESTREAM_NAVS_URL}/alt-requests`,
    label: "Yêu cầu thay đổi",
    roles: [
      "admin",
      "livestream-leader",
      "livestream-ast",
      "livestream-emp",
      "system-emp"
    ],
    icon: "IconAlertCircle"
  },
  // {
  //   to: `${LIVESTREAM_NAVS_URL}/stats`,
  //   label: "Chỉ số",
  //   roles: ["admin", "livestream-leader", "accounting-emp", "system-emp"],
  //   icon: "IconChartBar"
  // },
  {
    to: `${LIVESTREAM_NAVS_URL}/goals`,
    label: "KPI",
    roles: [
      "admin",
      "livestream-leader",
      "accounting-emp",
      "system-emp",
      "livestream-accounting"
    ],
    icon: "IconTarget"
  },
  {
    to: `${LIVESTREAM_NAVS_URL}/performance`,
    label: "Hiệu suất & lương",
    roles: [
      "admin",
      "livestream-leader",
      "system-emp",
      "livestream-emp",
      "livestream-ast",
      "livestream-accounting"
    ],
    icon: "IconCirclePercentage"
  },
  {
    to: `${LIVESTREAM_NAVS_URL}/salary`,
    label: "Tính lương",
    roles: ["admin"],
    icon: "IconCoin"
  },
  {
    to: `${LIVESTREAM_NAVS_URL}/channels`,
    label: "Kênh livestream",
    roles: ["admin", "livestream-leader", "system-emp"],
    icon: "IconAt"
  }
]

/** @constant */
export const SALES_NAVS: AppNavItem[] = [
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
    roles: ["admin", "sales-emp", "system-emp", "sales-accounting"],
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
    roles: ["admin", "sales-leader", "system-emp", "sales-accounting"],
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
export const ADMIN_NAVS: AppNavItem[] = [
  {
    to: `${ADMIN_NAVS_URL}/system-logs`,
    label: "Lịch sử hệ thống",
    icon: "IconAutomaticGearbox",
    roles: ["admin"]
  },
  {
    to: `${ADMIN_NAVS_URL}/tasks`,
    label: "Công việc",
    icon: "IconClipboardList",
    roles: ["admin"],
    beta: true
  }
]

export const getAppNavs = (basePath: string): AppNavItem[] => {
  switch (basePath) {
    case NAVS_URL:
    case WAREHOUSE_NAVS_URL:
      return WAREHOUSE_NAVS
    case TIKTOKSHOP_NAVS_URL:
      return TIKTOKSHOP_NAVS
    case SHOPEE_NAVS_URL:
      return SHOPEE_NAVS
    case LANDING_NAVS_URL:
      return LANDING_NAVS
    case LIVESTREAM_NAVS_URL:
      return LIVESTREAM_NAVS
    case SALES_NAVS_URL:
      return SALES_NAVS
    case ADMIN_NAVS_URL:
      return ADMIN_NAVS
    default:
      return []
  }
}

export const getNavsForPath = (pathname: string): AppNavItem[] => {
  if (
    pathname === NAVS_URL ||
    pathname.startsWith(`${NAVS_URL}/`) ||
    pathname === WAREHOUSE_NAVS_URL ||
    pathname.startsWith(`${WAREHOUSE_NAVS_URL}/`)
  ) {
    return WAREHOUSE_NAVS
  }

  if (
    pathname === TIKTOKSHOP_NAVS_URL ||
    pathname.startsWith(`${TIKTOKSHOP_NAVS_URL}/`)
  ) {
    return TIKTOKSHOP_NAVS
  }

  if (pathname === SHOPEE_NAVS_URL || pathname.startsWith(`${SHOPEE_NAVS_URL}/`)) {
    return SHOPEE_NAVS
  }

  if (pathname === LANDING_NAVS_URL || pathname.startsWith(`${LANDING_NAVS_URL}/`)) {
    return LANDING_NAVS
  }

  if (
    pathname === LIVESTREAM_NAVS_URL ||
    pathname.startsWith(`${LIVESTREAM_NAVS_URL}/`)
  ) {
    return LIVESTREAM_NAVS
  }

  if (pathname === SALES_NAVS_URL || pathname.startsWith(`${SALES_NAVS_URL}/`)) {
    return SALES_NAVS
  }

  if (pathname === ADMIN_NAVS_URL || pathname.startsWith(`${ADMIN_NAVS_URL}/`)) {
    return ADMIN_NAVS
  }

  return WAREHOUSE_NAVS
}
