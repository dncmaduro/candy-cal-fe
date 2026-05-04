/** @constant */
export const LEGACY_MARKETING_STORAGE_URL = "/marketing-storage"
/** @constant */
export const NAVS_URL = "/mkt-storage"
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

export const TIKTOKSHOP_EMPLOYEE_ROLES = ["order-emp", "tiktokshop-emp"]
export const TIKTOKSHOP_ROLES = [
  "admin",
  ...TIKTOKSHOP_EMPLOYEE_ROLES,
  "system-emp"
]
export const TIKTOKSHOP_EDITOR_ROLES = [
  "admin",
  ...TIKTOKSHOP_EMPLOYEE_ROLES
]
export const SHOPEE_ROLES = ["admin", "shopee-emp", "system-emp"]
export const SHOPEE_EDITOR_ROLES = ["admin", "shopee-emp"]
export const KHO_VAN_ROLES = ["admin", "accounting-emp", "system-emp"]
export const KHO_VAN_EDITOR_ROLES = ["admin", "accounting-emp"]

/** @constant */
export const NAVS = [
  // Ẩn khỏi sidebar kho vận theo yêu cầu hiện tại
  // {
  //   to: `${NAVS_URL}/logs`,
  //   label: "Lịch sử kho",
  //   roles: KHO_VAN_ROLES,
  //   icon: "IconHistory"
  // },
  {
    to: `${NAVS_URL}/accounting-storage`,
    label: "Kho hàng",
    icon: "IconBox",
    roles: KHO_VAN_ROLES
  },
  {
    to: `${NAVS_URL}/delivered-requests`,
    label: "Yêu cầu xuất hàng",
    icon: "IconTruck",
    roles: KHO_VAN_ROLES
  },
  {
    to: `${NAVS_URL}/incomes`,
    label: "Doanh thu TikTok",
    icon: "IconBrandTiktok",
    roles: KHO_VAN_ROLES
  },
  {
    to: `${NAVS_URL}/shopee-incomes`,
    label: "Doanh thu Shopee",
    icon: "IconBrandShopee",
    roles: KHO_VAN_ROLES
  },
  {
    to: `${NAVS_URL}/xlsx-calculators`,
    label: "Tính file XLSX",
    icon: "IconFileSpreadsheet",
    roles: KHO_VAN_ROLES
  }
  // {
  //   to: `${NAVS_URL}/ai`,
  //   label: "Trợ lý AI",
  //   icon: "IconSparkles",
  //   roles: [
  //     "admin",
  //     "order-emp",
  //     "accounting-emp",
  //     "system-emp",
  //     "sales-emp",
  //     "sales-leader",
  //     "sales-accounting",
  //     "livestream-emp",
  //     "livestream-ast",
  //     "livestream-leader",
  //     "livestream-accounting"
  //   ]
  // }
]

/** @constant */
export const TIKTOKSHOP_NAVS = [
  {
    to: `${TIKTOKSHOP_NAVS_URL}/sku`,
    label: "SKU",
    roles: TIKTOKSHOP_ROLES,
    icon: "IconBox"
  },
  {
    to: `${TIKTOKSHOP_NAVS_URL}/incomes`,
    label: "Doanh thu",
    roles: TIKTOKSHOP_ROLES,
    icon: "IconCoin"
  }
]

/** @constant */
export const SHOPEE_NAVS = [
  {
    to: `${SHOPEE_NAVS_URL}/sku`,
    label: "SKU",
    roles: SHOPEE_ROLES,
    icon: "IconBox"
  },
  {
    to: `${SHOPEE_NAVS_URL}/incomes`,
    label: "Doanh thu",
    roles: SHOPEE_ROLES,
    icon: "IconCoin"
  },
  {
    to: `${SHOPEE_NAVS_URL}/kpi`,
    label: "KPI",
    roles: SHOPEE_ROLES,
    icon: "IconTarget"
  }
]

/** @constant */
export const LANDING_NAVS = [
  {
    to: `${LANDING_NAVS_URL}/landing-page`,
    label: "Trang chủ",
    roles: [...TIKTOKSHOP_EMPLOYEE_ROLES, "system-emp"]
  }
]

/** @constant */
export const LIVESTREAM_NAVS = [
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
export const ADMIN_NAVS = [
  {
    to: `${ADMIN_NAVS_URL}/users`,
    label: "Người dùng",
    icon: "IconUsers",
    roles: ["admin"]
  },
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

export const STORAGE_APP_NAVS = {
  [NAVS_URL]: NAVS,
  [TIKTOKSHOP_NAVS_URL]: TIKTOKSHOP_NAVS,
  [SHOPEE_NAVS_URL]: SHOPEE_NAVS,
  [LEGACY_MARKETING_STORAGE_URL]: NAVS
} as const

export const getDefaultStorageAppBasePath = (roles: string[] = []) => {
  if (roles.includes("accounting-emp")) return NAVS_URL
  if (roles.includes("shopee-emp")) return SHOPEE_NAVS_URL
  if (roles.some((role) => TIKTOKSHOP_EMPLOYEE_ROLES.includes(role))) {
    return TIKTOKSHOP_NAVS_URL
  }
  return NAVS_URL
}

export const getStorageAppBasePath = (
  pathname: string,
  roles: string[] = []
) => {
  if (pathname.startsWith(TIKTOKSHOP_NAVS_URL)) return TIKTOKSHOP_NAVS_URL
  if (pathname.startsWith(SHOPEE_NAVS_URL)) return SHOPEE_NAVS_URL
  if (
    pathname.startsWith(NAVS_URL) ||
    pathname.startsWith(LEGACY_MARKETING_STORAGE_URL)
  ) {
    return NAVS_URL
  }
  return getDefaultStorageAppBasePath(roles)
}

export const getStorageNavsByPath = (
  pathname: string,
  roles: string[] = []
) => {
  const basePath = getStorageAppBasePath(pathname, roles)
  return STORAGE_APP_NAVS[basePath]
}
