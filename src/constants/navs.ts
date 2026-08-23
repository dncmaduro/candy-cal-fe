export const LEGACY_MARKETING_STORAGE_URL = "/marketing-storage"
export const NAVS_URL = "/mkt-storage"
export const TIKTOKSHOP_NAVS_URL = "/tiktokshop"
export const SHOPEE_NAVS_URL = "/shopee"
export const LANDING_NAVS_URL = "/landing"
export const LIVESTREAM_NAVS_URL = "/livestream"
export const SALES_NAVS_URL = "/sales"
export const ADMIN_NAVS_URL = "/admin"

export const STORAGE_ACCESS_PERMISSIONS = [
  "api.storageitems.search-items",
  "api.deliveredrequests.search-requests",
  "api.incomes.get-incomes-by-date-range",
  "api.shopeeincomes.search-incomes",
  "api.products.cal-xlsx"
]
export const TIKTOKSHOP_ACCESS_PERMISSIONS = [
  "api.products.search-products",
  "api.incomes.get-incomes-by-date-range"
]
export const SHOPEE_ACCESS_PERMISSIONS = [
  "api.shopeeproducts.search-shopee-products",
  "api.shopeeincomes.search-incomes",
  "api.shopeemonthkpis.get-shopee-month-kpis"
]
export const SALES_ACCESS_PERMISSIONS = [
  "api.sales-leads.pool",
  "api.salesfunnel.search-funnels",
  "api.salestasks.get-all-tasks",
  "api.salesorders.search-orders",
  "api.saleschannels.search-channels",
  "api.salesitems.search-sales-items",
  "api.salesdashboard.get-province-sales-stats",
  "api.salesdailyreports.get-reports-by-month",
  "api.salescustomerranks.get-all-ranks"
]

export type NavigationItem = {
  to: string
  label: string
  permissions: string[]
  icon: string
  deprecated?: boolean
  beta?: boolean
}

export const NAVS: NavigationItem[] = [
  { to: `${NAVS_URL}/accounting-storage`, label: "Kho hàng", icon: "IconBox", permissions: ["api.storageitems.search-items"] },
  { to: `${NAVS_URL}/delivered-requests`, label: "Yêu cầu xuất hàng", icon: "IconTruck", permissions: ["api.deliveredrequests.search-requests"] },
  { to: `${NAVS_URL}/incomes`, label: "Doanh thu TikTok", icon: "IconBrandTiktok", permissions: ["api.incomes.get-incomes-by-date-range"] },
  { to: `${NAVS_URL}/shopee-incomes`, label: "Doanh thu Shopee", icon: "IconBrandShopee", permissions: ["api.shopeeincomes.search-incomes"] },
  { to: `${NAVS_URL}/xlsx-calculators`, label: "Tính file XLSX", icon: "IconFileSpreadsheet", permissions: ["api.products.cal-xlsx"] }
]

export const TIKTOKSHOP_NAVS: NavigationItem[] = [
  { to: `${TIKTOKSHOP_NAVS_URL}/sku`, label: "SKU", icon: "IconBox", permissions: ["api.products.search-products"] },
  { to: `${TIKTOKSHOP_NAVS_URL}/incomes`, label: "Doanh thu", icon: "IconCoin", permissions: ["api.incomes.get-incomes-by-date-range"] }
]

export const SHOPEE_NAVS: NavigationItem[] = [
  { to: `${SHOPEE_NAVS_URL}/sku`, label: "SKU", icon: "IconBox", permissions: ["api.shopeeproducts.search-shopee-products"] },
  { to: `${SHOPEE_NAVS_URL}/incomes`, label: "Doanh thu", icon: "IconCoin", permissions: ["api.shopeeincomes.search-incomes"] },
  { to: `${SHOPEE_NAVS_URL}/kpi`, label: "KPI", icon: "IconTarget", permissions: ["api.shopeemonthkpis.get-shopee-month-kpis"] }
]

export const LANDING_NAVS: NavigationItem[] = []

export const LIVESTREAM_NAVS: NavigationItem[] = [
  { to: `${LIVESTREAM_NAVS_URL}/calendar`, label: "Lịch livestream", icon: "IconCalendar", permissions: ["api.livestreamcore.get-livestreams-by-date-range"] },
  { to: `${LIVESTREAM_NAVS_URL}/periods`, label: "Ca livestream", icon: "IconClock", permissions: ["api.livestreamperiods.get-all-livestream-periods"] },
  { to: `${LIVESTREAM_NAVS_URL}/reports`, label: "Báo cáo", icon: "IconReportAnalytics", permissions: ["api.livestreamanalytics.get-monthly-totals"] },
  { to: `${LIVESTREAM_NAVS_URL}/alt-requests`, label: "Yêu cầu thay đổi", icon: "IconAlertCircle", permissions: ["api.livestreamaltrequests.search-alt-requests"] },
  { to: `${LIVESTREAM_NAVS_URL}/goals`, label: "KPI", icon: "IconTarget", permissions: ["api.livestreammonthgoals.get-livestream-month-goals"] },
  { to: `${LIVESTREAM_NAVS_URL}/performance`, label: "Hiệu suất & lương", icon: "IconCirclePercentage", permissions: ["api.livestreamperformance.search-performances"] },
  { to: `${LIVESTREAM_NAVS_URL}/salary`, label: "Tính lương", icon: "IconCoin", permissions: ["api.livestreamsalary.search-salaries"] },
  { to: `${LIVESTREAM_NAVS_URL}/channels`, label: "Kênh livestream", icon: "IconAt", permissions: ["api.livestreamchannels.search-livestream-channels"] }
]

export const SALES_NAVS: NavigationItem[] = [
  { to: `${SALES_NAVS_URL}/leads`, label: "Quản lý lead", icon: "IconUserPlus", permissions: ["api.sales-leads.pool"] },
  { to: `${SALES_NAVS_URL}/funnel`, label: "Funnel khách", icon: "IconChartFunnel", permissions: ["api.salesfunnel.search-funnels"] },
  { to: `${SALES_NAVS_URL}/tasks`, label: "Công việc", icon: "IconChecklist", permissions: ["api.salestasks.get-all-tasks"] },
  { to: `${SALES_NAVS_URL}/orders`, label: "Đơn hàng", icon: "IconClipboardList", permissions: ["api.salesorders.search-orders"] },
  { to: `${SALES_NAVS_URL}/channels`, label: "Kênh bán hàng", icon: "IconAt", permissions: ["api.saleschannels.search-channels"] },
  { to: `${SALES_NAVS_URL}/items`, label: "Mặt hàng", icon: "IconPackage", permissions: ["api.salesitems.search-sales-items"] },
  { to: `${SALES_NAVS_URL}/dashboard`, label: "Chỉ số", icon: "IconChartBar", permissions: ["api.salesdashboard.get-province-sales-stats"] },
  { to: `${SALES_NAVS_URL}/daily-reports`, label: "Báo cáo hàng ngày", icon: "IconReportAnalytics", permissions: ["api.salesdailyreports.get-reports-by-month"] },
  { to: `${SALES_NAVS_URL}/customer-ranks`, label: "Hạng khách hàng", icon: "IconDeviceTabletStar", permissions: ["api.salescustomerranks.get-all-ranks"] }
]

export const ADMIN_NAVS: NavigationItem[] = [
  { to: `${ADMIN_NAVS_URL}/users`, label: "Người dùng", icon: "IconUsers", permissions: ["api.users.admin-list-users"] },
  { to: `${ADMIN_NAVS_URL}/system-logs`, label: "Lịch sử hệ thống", icon: "IconAutomaticGearbox", permissions: ["api.systemlogs.get-system-logs"] },
  { to: `${ADMIN_NAVS_URL}/tasks`, label: "Công việc", icon: "IconClipboardList", permissions: ["api.dailytasks.list-definitions"], beta: true }
]

export const hasAnyPermission = (userPermissions: string[] = [], required: string[] = []) =>
  required.length === 0 || required.some((permission) => userPermissions.includes(permission))

export const getVisibleNavigationItems = <T extends NavigationItem>(navs: T[], permissions: string[] = []) =>
  navs.filter((nav) => !nav.deprecated && hasAnyPermission(permissions, nav.permissions))

export const getVisibleSalesNavs = (permissions: string[] = []) =>
  getVisibleNavigationItems(SALES_NAVS, permissions)

export const getFirstAccessibleNavigationPath = (
  navs: NavigationItem[],
  permissions: string[] = []
) => getVisibleNavigationItems(navs, permissions)[0]?.to

export const canAccessSalesRoute = (permissions: string[] = [], pathname: string) =>
  getVisibleSalesNavs(permissions).some((nav) => pathname === nav.to || pathname.startsWith(`${nav.to}/`))

export const STORAGE_APP_NAVS = {
  [NAVS_URL]: NAVS,
  [TIKTOKSHOP_NAVS_URL]: TIKTOKSHOP_NAVS,
  [SHOPEE_NAVS_URL]: SHOPEE_NAVS,
  [LEGACY_MARKETING_STORAGE_URL]: NAVS
} as const

export const getStorageAppBasePath = (pathname: string) => {
  if (pathname.startsWith(TIKTOKSHOP_NAVS_URL)) return TIKTOKSHOP_NAVS_URL
  if (pathname.startsWith(SHOPEE_NAVS_URL)) return SHOPEE_NAVS_URL
  return NAVS_URL
}

export const getStorageNavsByPath = (pathname: string) =>
  STORAGE_APP_NAVS[getStorageAppBasePath(pathname)]
