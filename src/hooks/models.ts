/** @interface */
export interface CreateItemRequest {
  name: string
  note?: string
  variants: string[]
}

/** @interface */
export interface CreateStorageItemRequest {
  code: string
  name: string
  quantityPerBox: number
  receivedQuantity: {
    quantity: number
    real: number
  }
  deliveredQuantity: {
    quantity: number
    real: number
  }
  restQuantity: {
    quantity: number
    real: number
  }
  note?: string
}

/** @interface */
export interface ItemResponse {
  _id: string
  name: string
  note?: string
  variants: string[]
}

/** @interface */
export interface SearchStorageItemsRequest {
  searchText?: string
  deleted: boolean
}

/** @interface */
export interface SearchStorageItemResponse {
  _id: string
  name: string
  quantityPerBox: number
  receivedQuantity: {
    quantity: number
    real: number
  }
  deliveredQuantity: {
    quantity: number
    real: number
  }
  restQuantity: {
    quantity: number
    real: number
  }
  deletedAt?: string
  code: string
  note?: string
}

/** @interface */
export interface RestoreStorageItemRequest {
  id: string
}

/** @interface */
export interface CreateProductRequest {
  name: string
  items: {
    _id: string
    quantity: number
  }[]
}

/** @interface */
export interface ProductResponse {
  _id: string
  name: string
  items: {
    _id: string
    quantity: number
  }[]
  deletedAt?: string
}

/** @interface */
export interface SearchProductsRequest {
  searchText?: string
  deleted?: boolean
}

/** @interface */
export interface CreateComboRequest {
  name: string
  products: {
    _id: string
    quantity: number
  }[]
}

/** @interface */
export interface ComboResponse {
  _id: string
  name: string
  products: {
    _id: string
    quantity: number
  }[]
}

/** @interface */
export interface CalCombosRequest {
  products: {
    _id: string
    quantity: number
  }[]
  quantity: number
}

/** @interface */
export interface CalItemsResponse {
  items: {
    _id: string
    name: string
    quantity: number
    storageItems: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
      _id: string
    }[]
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
  total: number
}

/** @interface */
export interface CalItemsRequest {
  products: {
    _id: string
    quantity: number
    customers: number
  }[]
}

/** @interface */
export interface CalFileRequest {
  file: Express.Multer.File
}

/** @interface */
export interface LoginRequest {
  username: string
  password: string
}

/** @interface */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

/** @interface */
export interface RefreshTokenRequest {
  refreshToken: string
}

/** @interface */
export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

/** @interface */
export interface CheckTokenRequest {
  accessToken: string
}

/** @interface */
export interface CheckTokenResponse {
  valid: boolean
}

/** @deprecated */
/** @interface */
export interface CreateLogRequest {
  date: Date
  items: {
    _id: string
    quantity: number
    storageItems: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
    }[]
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
}

/** @interface */
export interface GetLogsRequest {
  page: number
  limit: number
}

/** @interface */
export interface Log {
  date: string
  items: {
    _id: string
    quantity: number
    storageItems: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
      _id: string
    }[]
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
  updatedAt: string
}

/** @interface */
export interface GetLogsResponse {
  data: Log[]
  total: number
}

/** @interface */
export interface GetLogsRangeRequest {
  startDate: string
  endDate: string
}

/** @interface */
export interface GetLogsRangeResponse {
  startDate: string
  endDate: string
  items: {
    _id: string
    quantity: number
    storageItems: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
    }[]
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
  total: number
}

/** @interface */
export interface GetMeResponse {
  username: string
  name: string
  roles: string[]
  avatarUrl?: string
  _id: string
}

/** @interface */
export interface GetStorageLogsRequest {
  page: number
  limit: number
  startDate?: string
  endDate?: string
  status?: string
  tag?: string
  itemId?: string
}

/** @interface */
export interface GetStorageLogsResponse {
  data: {
    _id: string
    item: {
      _id: string
      quantity: number
    }
    items: {
      _id: string
      quantity: number
    }[]
    note?: string
    status: string
    date: Date
    tag?: string
    deliveredRequestId?: string
  }[]
  total: number
}

/** @interface */
export interface CreateStorageLogRequest {
  items: {
    _id: string
    quantity: number
  }[]
  note?: string
  status: string
  date: Date
  tag?: string
}

/** @interface */
export interface CreateStorageLogResponse {
  items: {
    _id: string
    quantity: number
  }[]
  note?: string
  status: string
  date: Date
  tag?: string
  _id: string
}

/** @interface */
export interface UpdateStorageLogRequest {
  items: {
    _id: string
    quantity: number
  }[]
  note?: string
  status: string
  date: Date
  tag?: string
}

/** @interface */
export interface UpdateStorageLogResponse {
  items: {
    _id: string
    quantity: number
  }[]
  note?: string
  status: string
  date: Date
  tag?: string
  _id: string
}

/** @interface */
export interface GetStorageLogsByMonthRequest {
  year: number
  month: number
  tag?: string
}

/** @interface */
export interface GetStorageLogsByMonthResponse {
  items: {
    _id: string
    name: string
    deliveredQuantity: number
    receivedQuantity: number
  }[]
  byDay: {
    day: number
    items: {
      _id: string
      name: string
      deliveredQuantity: number
      receivedQuantity: number
    }[]
  }[]
}

/** @interface */
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

/** @interface */
export interface ChangePasswordResponse {
  message: string
}

/** @interface */
export interface UpdateAvatarRequest {
  avatarUrl: string
}

/** @interface */
export interface UpdateAvatarResponse {
  message: string
}

/** @interface */
export interface UpdateUserRequest {
  name: string
}

/** @interface */
export interface UpdateUserResponse {
  message: string
}

/** @interface */
export interface CreateDeliveredRequestRequest {
  items: {
    _id: string
    quantity: number
  }[]
  note?: string
  date: Date
}

/** @interface */
export interface CreateDeliveredRequestResponse {
  date: Date
  items: {
    _id: string
    quantity: number
  }[]
  note?: string
  accepted?: boolean
  updatedAt?: Date
  comments?: {
    userId: string
    name: string
    text: string
    date: Date
  }[]
}

/** @interface */
export interface CreateDeliveredRequestCommentRequest {
  requestId: string
  comment: {
    userId: string
    name: string
    text: string
    date: Date
  }
}

/** @interface */
export interface CreateDeliveredRequestCommentResponse {
  date: Date
  items: {
    _id: string
    quantity: number
  }[]
  note?: string
  accepted?: boolean
  updatedAt?: Date
  comments?: {
    userId: string
    name: string
    text: string
    date: Date
  }[]
}

/** @interface */
export interface AcceptDeliveredRequestRequest {
  requestId: string
}

/** @interface */
export interface AcceptDeliveredRequestResponse {
  date: Date
  items: {
    _id: string
    quantity: number
  }[]
  note?: string
  accepted?: boolean
  updatedAt?: Date
  comments?: {
    userId: string
    name: string
    text: string
    date: Date
  }[]
}

/** @interface */
export interface SearchDeliveredRequestsRequest {
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

/** @interface */
export interface SearchDeliveredRequestsResponse {
  requests: {
    _id: string
    date: Date
    items: {
      _id: string
      quantity: number
    }[]
    note?: string
    accepted?: boolean
    updatedAt?: Date
    comments?: {
      userId: string
      name: string
      text: string
      date: Date
    }[]
  }[]
  total: number
}

/** @interface */
export interface GetDeliveredRequestRequest {
  requestId: string
}

/** @interface */
export interface GetDeliveredRequestResponse {
  date: Date
  items: {
    _id: string
    quantity: number
  }[]
  note?: string
  accepted?: boolean
  updatedAt?: Date
  comments?: {
    userId: string
    name: string
    text: string
    date: Date
  }[]
}

/** @interface */
export interface Notification {
  _id: string
  title: string
  content: string
  createdAt: string
  read: boolean
  type: string
  link?: string
}

/** @interface */
export interface GetNotificationsRequest {
  page: number
}

/** @interface */
export interface GetNotificationsResponse {
  notifications: Notification[]
  hasMore: boolean
}

/** @interface */
export interface UndoAcceptDeliveredRequestRequest {
  requestId: string
}

/** @interface */
export interface CreateReadyComboRequest {
  products: {
    _id: string
    quantity: number
  }[]
  isReady: boolean
  note?: string
}

/** @interface */
export interface ReadyComboResponse {
  _id: string
  products: {
    _id: string
    quantity: number
  }[]
  isReady: boolean
  note?: string
}

/** @interface */
export interface UpdateReadyComboRequest {
  products: {
    _id: string
    quantity: number
  }[]
  isReady: boolean
  note?: string
}

/** @interface */
export interface SearchCombosRequest {
  searchText?: string
  isReady?: boolean
}

/** @interface */
export interface LandingRequest {
  page: number
  pageSize: number
}

/** @interface */
export interface LandingResponse {
  data: {
    _id: string
    fullName: string
    phoneNumber: string
    company: string
    quantity: number
    address: string
    created_at: string
  }[]
  total: number
  page: number
  pageSize: number
}

/** @interface */
export interface GetOrderLogsRequest {
  page: number
  limit: number
}

/** @interface */
export interface OrderLogItem {
  _id: string
  quantity: number
  storageItems: {
    code: string
    name: string
    receivedQuantity: {
      quantity: number
      real: number
    }
    deliveredQuantity: {
      quantity: number
      real: number
    }
    restQuantity: {
      quantity: number
      real: number
    }
    note?: string
  }[]
}

/** @interface */
export interface OrderLogProduct {
  name: string
  quantity: number
}

/** @interface */
export interface OrderLogOrder {
  products: OrderLogProduct[]
  quantity: number
}

/** @interface */
export interface OrderLogSession {
  items: OrderLogItem[]
  orders: OrderLogOrder[]
}

/** @interface */
export interface GetOrderLogsResponse {
  data: {
    morning: OrderLogSession
    afternoon?: OrderLogSession
    date: string
    updatedAt: string
  }[]
  total: number
}

/** @interface */
export interface CreateLogSessionRequest {
  date: Date
  items: OrderLogItem[]
  orders: OrderLogOrder[]
  session: "morning" | "afternoon"
}

/** @interface */
export interface CreateLogSessionResponse {
  morning: OrderLogSession
  afternoon?: OrderLogSession
  date: string
  updatedAt: string
}

/** @interface */
export interface GetOrderLogsByRangeRequest {
  startDate: string
  endDate: string
  session: "morning" | "afternoon" | "all"
}

/** @interface */
export interface GetOrderLogsByRangeResponse {
  startDate: string
  endDate: string
  items: {
    _id: string
    quantity: number
    storageItems: OrderLogItem["storageItems"]
  }[]
  orders: { products: OrderLogProduct[]; quantity: number }[]
  total: number
}

/** @deprecated */
/** @interface */
export interface InsertIncomeRequest {
  type: "affiliate" | "ads" | "other"
  date: Date
}

/** @deprecated */
/** @interface */
export interface InsertIncomeResponse {
  success: true
}

/** @interface */
export interface DeleteIncomeByDateRequest {
  date: Date
}

/** @deprecated */
/** @interface */
export interface UpdateAffiliateTypeResponse {
  success: true
}

/** @interface */
export interface GetIncomesByDateRangeRequest {
  startDate: string
  endDate: string
  page: number
  limit: number
  orderId?: string
  productCode?: string
  productSource?: string
  channelId?: string
}

/** @interface */
export interface GetIncomesByDateRangeResponse {
  incomes: {
    _id: string
    orderId: string
    customer: string
    province: string
    shippingProvider: string
    channel?: {
      _id: string
      name: string
    }
    date: Date
    products: {
      creator?: string
      code: string
      name: string
      source: "affiliate" | "affiliate-ads" | "ads" | "other"
      quantity: number
      quotation: number
      price: number
      platformDiscount: number
      sellerDiscount: number
      priceAfterDiscount: number
      affiliateAdsPercentage?: number
      affiliateAdsAmount?: number
      standardAffPercentage?: number
      standardAffAmount?: number
      sourceChecked: boolean
      content?: string
      box?: string
    }[]
  }[]
  total: number
}

/** @interface */
export interface UpdateIncomesBoxRequest {
  date: Date
}

/** @interface */
export interface GetTotalIncomesByMonthRequest {
  month: number
  year: number
  channelId?: string
}

/** @interface */
export interface GetTotalIncomesByMonthResponse {
  totalIncome: {
    beforeDiscount: { live: number; shop: number }
    afterDiscount: { live: number; shop: number }
  }
}

/** @interface */
export interface GetTotalQuantityByMonthRequest {
  month: number
  year: number
  channelId?: string
}

/** @interface */
export interface GetTotalQuantityByMonthResponse {
  totalQuantity: {
    live: number
    shop: number
  }
}

/** @interface */
export interface GetKPIPercentageByMonthRequest {
  month: number
  year: number
  channelId?: string
}

/** @interface */
export interface GetKPIPercentageByMonthResponse {
  KPIPercentage: {
    live: number
    shop: number
  }
}

/** @interface */
export interface CreateMonthGoalRequest {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
  liveAdsPercentageGoal: number
  shopAdsPercentageGoal: number
  channel: string
}

/** @interface */
export interface CreateMonthGoalResponse {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
  liveAdsPercentageGoal: number
  shopAdsPercentageGoal: number
  channel: {
    _id: string
    name: string
  }
}

/** @interface */
export interface GetGoalsRequest {
  year?: number
  channelId?: string
}

/** @interface */
export interface GetGoalsResponse {
  monthGoals: {
    month: number
    year: number
    liveStreamGoal: number
    shopGoal: number
    channel: {
      name: string
      _id: string
    }
    liveAdsPercentageGoal: number
    shopAdsPercentageGoal: number
    totalIncome: {
      beforeDiscount: { live: number; shop: number }
      afterDiscount: { live: number; shop: number }
    }
    totalQuantity: { live: number; shop: number }
    KPIPercentage: {
      beforeDiscount: { live: number; shop: number }
      afterDiscount: { live: number; shop: number }
    }
    adsPercentage: { live: number; shop: number }
    adsGoalComparison: { live: number; shop: number }
  }[]
  total: number
}

/** @interface */
export interface GetGoalRequest {
  month: number
  year: number
  channelId?: string
}

/** @interface */
export interface GetGoalResponse {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
  liveAdsPercentageGoal: number
  shopAdsPercentageGoal: number
  channel: string
}

/** @interface */
export interface UpdateGoalRequest {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
  liveAdsPercentageGoal: number
  shopAdsPercentageGoal: number
  channel: string
}

/** @interface */
export interface UpdateGoalResponse {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
  liveAdsPercentageGoal: number
  shopAdsPercentageGoal: number
  channel: string
}

/** @interface */
export interface DeleteGoalRequest {
  month: number
  year: number
  channelId: string
}

/** @interface */
export interface CreatePackingRuleRequest {
  products: {
    productCode: string
    minQuantity: number | null
    maxQuantity: number | null
  }[]
  packingType: string
}

/** @interface */
export interface CreatePackingRuleResponse {
  products: {
    productCode: string
    minQuantity: number | null
    maxQuantity: number | null
  }[]
  packingType: string
}

/** @interface */
export interface UpdatePackingRuleRequest {
  products: {
    productCode: string
    minQuantity: number | null
    maxQuantity: number | null
  }[]
  packingType: string
}

/** @interface */
export interface UpdatePackingRuleResponse {
  products: {
    productCode: string
    minQuantity: number | null
    maxQuantity: number | null
  }[]
  packingType: string
}

/** @interface */
export interface GetPackingRuleResponse {
  products: {
    productCode: string
    minQuantity: number | null
    maxQuantity: number | null
  }[]
  packingType: string
}

/** @interface */
export interface SearchPackingRulesRequest {
  searchText?: string
  packingType?: string
}

/** @interface */
export interface SearchPackingRulesResponse {
  rules: {
    products: {
      productCode: string
      minQuantity: number | null
      maxQuantity: number | null
    }[]
    packingType: string
  }[]
}

/** @interface */
export interface ExportXlsxIncomesRequest {
  startDate: string
  endDate: string
  orderId?: string
  productCode?: string
  productSource?: string
  channel?: string
}

/** @interface */
export interface CreateSessionLogRequest {
  time: Date
  items: {
    _id: string
    quantity: number
    storageItems: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
    }[]
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
}

/** @interface */
export interface GetSessionLogsRequest {
  page: number
  limit: number
}

/** @interface */
export interface GetSessionLogsResponse {
  data: {
    _id: string
    time: Date
    items: {
      _id: string
      quantity: number
      storageItems: {
        code: string
        name: string
        receivedQuantity: {
          quantity: number
          real: number
        }
        deliveredQuantity: {
          quantity: number
          real: number
        }
        restQuantity: {
          quantity: number
          real: number
        }
        note?: string
      }[]
    }[]
    orders: {
      products: {
        name: string
        quantity: number
      }[]
      quantity: number
    }[]
  }[]
  total: number
}

/** @interface */
export interface CreateDailyLogRequest {
  date: Date
  items: {
    _id: string
    quantity: number
    storageItems: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
    }[]
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
}

/** @interface */
export interface GetDailyLogsRequest {
  page: number
  limit: number
}

/** @interface */
export interface GetDailyLogsResponse {
  data: {
    _id: string
    date: Date
    items: {
      _id: string
      quantity: number
      storageItems: {
        code: string
        name: string
        receivedQuantity: {
          quantity: number
          real: number
        }
        deliveredQuantity: {
          quantity: number
          real: number
        }
        restQuantity: {
          quantity: number
          real: number
        }
        note?: string
      }[]
    }[]
    orders: {
      products: {
        name: string
        quantity: number
      }[]
      quantity: number
    }[]
    updatedAt: string
  }[]
  total: number
}

/** @interface */
export interface GetDailyLogByDateRequest {
  date: Date
}

/** @interface */
export interface GetDailyLogByDateResponse {
  _id: string
  date: Date
  items: {
    _id: string
    quantity: number
    storageItems: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
    }[]
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
  updatedAt: string
}

/** @interface */
export interface GetSessionLogByIdRequest {
  id: string
}

/** @interface */
export interface GetSessionLogByIdResponse {
  _id: string
  time: Date
  items: {
    _id: string
    quantity: number
    storageItems: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
    }[]
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
  updatedAt: string
}

/** @interface */
export interface GetUnviewedCountResponse {
  count: number
}

/** @interface */
export interface GetSystemLogsRequest {
  page: number
  limit: number
  startTime?: string
  endTime?: string
  userId?: string
  type?: string
  action?: string
  entity?: string
  entityId?: string
  result?: "success" | "failed"
}

/** @interface */
export interface GetSystemLogsResponse {
  data: {
    _id: string
    type: string
    action: string
    userId: string
    time: Date
    entity?: string
    entityId?: string
    result?: "success" | "failed"
    meta?: Record<string, any>
    ip?: string
    userAgent?: string
  }[]
  total: number
}

/** @interface */
export interface GetInformationSystemLogsRespomse {
  data: {
    label: string
    value: string
  }[]
}

/** @interface */
export interface GetRangeStatsRequest {
  startDate: string
  endDate: string
  channelId?: string
}

/** @interface */
export interface GetRangeStatsResponse {
  period: { startDate: Date; endDate: Date; days: number }
  current: {
    beforeDiscount: {
      totalIncome: number
      liveIncome: number
      videoIncome: number
      ownVideoIncome: number
      otherVideoIncome: number
      otherIncome: number
      sources: {
        ads: number
        affiliate: number
        affiliateAds: number
        other: number
      }
    }
    afterDiscount: {
      totalIncome: number
      liveIncome: number
      videoIncome: number
      ownVideoIncome: number
      otherVideoIncome: number
      otherIncome: number
      sources: {
        ads: number
        affiliate: number
        affiliateAds: number
        other: number
      }
    }
    boxes: { box: string; quantity: number }[]
    shippingProviders: { provider: string; orders: number }[]
    ads: {
      liveAdsCost: number
      shopAdsCost: number
      percentages: {
        liveAdsToLiveIncome: number
        shopAdsToShopIncome: number
      }
    }
    discounts: {
      totalPlatformDiscount: number
      totalSellerDiscount: number
      totalDiscount: number
      avgDiscountPerOrder: number
      discountPercentage: number
    }
  }
  changes?: {
    beforeDiscount: {
      totalIncomePct: number
      liveIncomePct: number
      videoIncomePct: number
      ownVideoIncomePct: number
      otherVideoIncomePct: number
      sources: {
        adsPct: number
        affiliatePct: number
        affiliateAdsPct: number
        otherPct: number
      }
    }
    afterDiscount: {
      totalIncomePct: number
      liveIncomePct: number
      videoIncomePct: number
      ownVideoIncomePct: number
      otherVideoIncomePct: number
      sources: {
        adsPct: number
        affiliatePct: number
        affiliateAdsPct: number
        otherPct: number
      }
    }
    ads: {
      liveAdsCostPct: number
      shopAdsCostPct: number
      liveAdsToLiveIncomePctDiff: number
      shopAdsToShopIncomePctDiff: number
    }
    discounts: {
      totalPlatformDiscountPct: number
      totalSellerDiscountPct: number
      totalDiscountPct: number
      avgDiscountPerOrderPct: number
      discountPercentageDiff: number
    }
  }
}

/** @interface */
export interface GetTopCreatorsRequest {
  startDate: string
  endDate: string
}

/** @interface */
export interface TopCreatorItem {
  creator: string
  totalIncome: number
  percentage: number
}

/** @interface */
export interface GetTopCreatorsResponse {
  affiliate: {
    beforeDiscount: TopCreatorItem[]
    afterDiscount: TopCreatorItem[]
  }
  affiliateAds: {
    beforeDiscount: TopCreatorItem[]
    afterDiscount: TopCreatorItem[]
  }
}

/** @interface */
export interface DailyTaskItem {
  code: string
  title: string
  status: "pending" | "done" | "auto" | "expired"
  type?: "manual" | "http"
  http?: {
    endpointKey: string
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
    url: string
    runAt?: string
    successStatus?: number
    autoCompleteOnSuccess?: boolean
    maxAttempts?: number
    attempts?: number
  }
  completedAt?: Date
}

/** @interface */
export interface GetOwnTasksResponse {
  data: {
    date: string
    tasks: DailyTaskItem[]
    summary: {
      total: number
      done: number
      auto: number
      pending: number
      expired: number
    }
  }
}

/** @interface */
export interface MarkTaskAsDoneRequest {
  code: string
}

/** @interface */
export interface MarkTaskAsDoneResponse {
  updated: boolean
}

/** @interface */
export interface TaskDefinition {
  code: string
  title: string
  roles: string[]
  active: boolean
  order: number
  autoComplete: boolean
  type: "manual" | "http"
  httpConfig?: {
    endpointKey: string
    runAt: string
    successStatus?: number
    successJsonPath?: string
    successEquals?: any
    autoCompleteOnSuccess: boolean
    maxAttempts: number
  }
  createdAt?: Date
  updatedAt?: Date
}

/** @interface */
export interface GetAllTasksDefinitionsRequest {
  limit?: number
  page?: number
}

/** @interface */
export interface GetAllTasksDefinitionsResponse {
  data: TaskDefinition[]
  total: number
}

/** @interface */
export interface CreateTaskDefinitionRequest {
  code: string
  title: string
  roles: string[]
  order?: number
  autoComplete?: boolean // manual only
  type?: "manual" | "http"
  httpConfig?: {
    endpointKey: string
    runAt: string
    successStatus?: number
    successJsonPath?: string
    successEquals?: any
    autoCompleteOnSuccess?: boolean
    maxAttempts?: number
  }
}

/** @interface */
export interface CreateTaskDefinitionResponse {
  data: TaskDefinition
}

/** @interface */
export interface UpdateTaskDefinitionRequest {
  title?: string
  roles?: string[]
  active?: boolean
  order?: number
  autoComplete?: boolean
  type?: "manual" | "http"
  httpConfig?: {
    endpointKey?: string
    runAt?: string
    successStatus?: number
    successJsonPath?: string
    successEquals?: any
    autoCompleteOnSuccess?: boolean
    maxAttempts?: number
  }
}

/** @interface */
export interface UpdateTaskDefinitionResponse {
  data: TaskDefinition
}

/** @interface */
export interface DeleteTaskDefinitionResponse {
  deleted: boolean
}

/** @interface */
export interface APIEndpoint {
  _id: string
  key: string
  active: boolean
  createdAt: string
  deleted: boolean
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  name: string
  updatedAt: string
  url: string
}

/** @interface */
export interface GetAllAPIEndpointsResponse {
  data: APIEndpoint[]
}

/** @interface */
export interface GenerateTasksRequest {
  date: Date
}

/** @interface */
export interface GenerateTasksResponse {
  data: {
    date: string
    tasksCreated: number
  }
}

/** @interface */
export interface GetAllUsersTasksRequest {
  date: Date
}

/** @interface */
export interface GetAllUsersTasksResponse {
  data: {
    date: string
    items: {
      userId: string
      total: number
      done: number
    }[]
  }
}

/** @interface */
export interface GetUserTasksRequest {
  date: Date
}

/** @interface */
export interface GetUserTasksResponse {
  data: {
    date: string
    tasks: DailyTaskItem[]
    summary: {
      total: number
      done: number
      auto: number
      pending: number
      expired: number
    }
  }
}

/** @interface */
export interface SystemLogsOptionsResponse {
  data: {
    label: string
    value: string
  }[]
}

// -------------------- DASHBOARD --------------------

/** @interface */
export interface GetTotalLiveAndShopIncomeByMonthRequest {
  month: number
  year: number
  channelId?: string
}

/** @interface */
export interface GetTotalLiveAndShopIncomeByMonthResponse {
  totalIncome: {
    beforeDiscount: { live: number; shop: number }
    afterDiscount: { live: number; shop: number }
  }
}

/** @interface */
export interface GetAdsCostSplitByMonthRequest {
  month: number
  year: number
  channelId?: string
}

/** @interface */
export interface GetAdsCostSplitByMonthResponse {
  liveAdsCost: number
  shopAdsCost: number
  percentages: { liveAdsToLiveIncome: number; shopAdsToShopIncome: number }
  totalIncome: { live: number; shop: number }
}

/** @interface */
export interface CreateDailyAdsRequest {
  date: Date
  currency: "vnd" | "usd"
  channel: string
}

/** @interface */
export interface CreateSimpleDailyAdsRequest {
  date: Date
  liveAdsCost: number
  shopAdsCost: number
  currency: "vnd" | "usd"
  channel: string
}

// -------------------- INCOME AND SOURCE --------------------

/** @interface */
export interface CreateDailyAdsWithSavedAdsCostRequest {
  date: Date
}

/** @interface */
export interface GetPreviousDailyAdsBefore4pmRequest {
  date: Date
}

/** @interface */
export interface GetPreviousDailyAdsBefore4pmResponse {
  date: string
  before4pmLiveAdsCost: number
  before4pmShopAdsCost: number
  totalBefore4pmCost: number
}

/** @interface */
export interface InsertIncomeAndUpdateSourceRequest {
  date: Date
  channel: string
}

/** @interface */
export interface InsertIncomeAndUpdateSourceResponse {
  success: true
}

// -------------------- LIVESTREAM EMPLOYEES --------------------

/** @interface */
export interface CreateLivestreamEmployeeRequest {
  name: string
  active?: boolean
}

/** @interface */
export interface UpdateLivestreamEmployeeRequest {
  name?: string
  active?: boolean
}

/** @interface */
export interface SearchLivestreamEmployeesRequest {
  page: number
  limit: number
  active?: boolean
}

/** @interface */
export interface SearchLivestreamEmployeesResponse {
  data: {
    _id: string
    name: string
    active?: boolean
  }[]
  total: number
}

/** @interface */
export interface GetDetailLivestreamEmployeeRequest {
  id: string
}

/** @interface */
export interface GetDetailLivestreamEmployeeResponse {
  _id: string
  name: string
  active?: boolean
}

/** @interface */
export interface DeleteLivestreamEmployeeRequest {
  id: string
}

// -------------------- LIVESTREAM PERIODS --------------------

/** @interface */
export interface CreateLivestreamPeriodRequest {
  startTime: {
    hour: number
    minute: number
  }
  endTime: {
    hour: number
    minute: number
  }
  channel: string
  noon?: boolean
}

/** @interface */
export interface GetAllLivestreamPeriodsResponse {
  periods: {
    _id: string
    startTime: {
      hour: number
      minute: number
    }
    endTime: {
      hour: number
      minute: number
    }
    channel: string
    noon?: boolean
  }[]
}

/** @interface */
export interface GetDetailLivestreamPeriodRequest {
  id: string
}

/** @interface */
export interface GetDetailLivestreamPeriodResponse {
  _id: string
  startTime: {
    hour: number
    minute: number
  }
  endTime: {
    hour: number
    minute: number
  }
  channel: string
  noon?: boolean
}

/** @interface */
export interface UpdateLivestreamPeriodRequest {
  startTime?: {
    hour: number
    minute: number
  }
  endTime?: {
    hour: number
    minute: number
  }
  channel?: string
  noon?: boolean
}

/** @interface */
export interface DeleteLivestreamPeriodRequest {
  id: string
}

// -------------------- LIVESTREAM RANGES --------------------

/** @interface */
export interface CreateLivestreamRangeRequest {
  startDate: Date
  endDate: Date
  snapshots?: string[]
}

/** @interface */
export interface AddLivestreamSnapshotRequest {
  period: string
  host: string
  assistant: string
  goal: number
  income?: number
  noon?: boolean
}

/** @interface */
export interface UpdateLivestreamSnapshotRequest {
  period?: string
  host?: string
  assistant?: string
  goal?: number
  income?: number
  noon?: boolean
}

/** @interface */
export interface DeleteLivestreamSnapshotRequest {
  id: string
}

/** @interface */
export interface SetMetricsRequest {
  totalOrders?: number
  // totalIncome?: number
  ads?: number
}

/** @interface */
export interface GetLivestreamByDateRangeRequest {
  startDate: string
  endDate: string
}

/** @interface */
export interface GetLivestreamByDateRangeResponse {
  livestreams: {
    _id: string
    date: string
    snapshots: {
      _id: string
      period: {
        _id?: string
        startTime: { hour: number; minute: number }
        endTime: { hour: number; minute: number }
        channel: string
        noon?: boolean
      }
      host: string
      assistant: string
      goal: number
      income?: number
      noon?: boolean
    }[]
    totalOrders: number
    totalIncome: number
    ads: number
  }[]
}

/** @interface */
export interface GetMonthlyTotalsLivestreamRequest {
  month: number
  year: number
}

/** @interface */
export interface GetMonthlyTotalsLivestreamResponse {
  totalOrders: number
  totalIncome: number
  totalAds: number
}

// -------------------- LIVESTREAM STATS --------------------

/** @interface */
export interface GetLivestreamStatsRequest {
  startDate: string
  endDate: string
}

/** @interface */
export interface GetLivestreamStatsResponse {
  totalIncome: number
  totalExpenses: number
  totalOrders: number
  incomeByHost: { hostId: string; income: number }[]
}

// -------------------- SHOPEE PRODUCTS --------------------

/** @interface */
export interface CreateShopeeProductRequest {
  name: string
  items: {
    _id: string
    quantity: number
  }[]
}

/** @interface */
export interface UpdateShopeeProductRequest {
  name: string
  items: {
    _id: string
    quantity: number
  }[]
}

/** @interface */
export interface DeleteShopeeProductRequest {
  id: string
}

/** @interface */
export interface GetAllShopeeProductsResponse {
  products: {
    _id: string
    name: string
    items: {
      _id: string
      quantity: number
    }[]
  }[]
}

/** @interface */
export interface GetShopeeProductByIdRequest {
  id: string
}

/** @interface */
export interface GetShopeeProductByIdResponse {
  _id: string
  name: string
  items: {
    _id: string
    quantity: number
  }[]
}

/** @interface */
export interface SearchShopeeProductsRequest {
  searchText?: string
  page: number
  limit: number
}

/** @interface */
export interface SearchShopeeProductsResponse {
  data: {
    _id: string
    name: string
    items: {
      _id: string
      quantity: number
    }[]
  }[]
  total: number
}

// -------------------- SHOPEE CALCULATION --------------------

/** @interface */
export interface CalXlsxShopeeRequest {
  file: File
}

/** @interface */
export interface CalXlsxShopeeResponse {
  items: {
    _id: string
    name: string
    quantity: number
    storageItem: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
    } | null
  }[]
  orders: {
    products: { sku: string; name?: string; quantity: number }[]
    quantity: number
  }[]
  total: number
}

// -------------------- LIVESTREAM GOALS --------------------

/** @interface */
export interface CreateLivestreamMonthGoalRequest {
  month: number
  year: number
  channel: string
  goal: number
}

/** @interface */
export interface GetLivestreamMonthGoalsRequest {
  page: number
  limit: number
  channel?: string
}

/** @interface */
export interface GetLivestreamMonthGoalsResponse {
  data: {
    _id: string
    month: number
    year: number
    channel: {
      _id: string
      name: string
    }
    goal: number
  }[]
  total: number
}

/** @interface */
export interface UpdateLivestreamMonthGoalRequest {
  goal?: number
}

/** @interface */
export interface DeleteLivestreamMonthGoalRequest {
  id: string
}

// -------------------- LIVESTREAM CHANNELS --------------------

/** @interface */
export interface CreateLivestreamChannelRequest {
  name: string
  username: string
  link: string
}

/** @interface */
export interface SearchLivestreamChannelsRequest {
  searchText?: string
  page: number
  limit: number
}

/** @interface */
export interface SearchLivestreamChannelsResponse {
  data: {
    _id: string
    name: string
    username: string
    link: string
  }[]
  total: number
}

/** @interface */
export interface GetLivestreamChannelDetailRequest {
  id: string
}

/** @interface */
export interface GetLivestreamChannelDetailResponse {
  _id: string
  name: string
  username: string
  link: string
}

/** @interface */
export interface UpdateLivestreamChannelRequest {
  name?: string
  username?: string
  link?: string
}

/** @interface */
export interface DeleteLivestreamChannelRequest {
  id: string
}

// -------------------- SALES CHANNELS --------------------

/** @interface */
export interface CreateSalesChannelRequest {
  channelName: string
  assignedTo?: string
  phoneNumber: string
  address: string
  avatarUrl: string
}

/** @interface */
export interface CreateSalesChannelResponse {
  _id: string
  channelName: string
  phoneNumber: string
  address: string
  avatarUrl: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface UpdateSalesChannelRequest {
  channelName?: string
  assignedTo?: string
  phoneNumber?: string
  address?: string
  avatarUrl?: string
}

/** @interface */
export interface UpdateSalesChannelResponse {
  _id: string
  channelName: string
  phoneNumber: string
  address: string
  avatarUrl: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface DeleteSalesChannelRequest {
  id: string
}

/** @interface */
export interface SearchSalesChannelRequest {
  searchText?: string
  page: number
  limit: number
}

/** @interface */
export interface SearchSalesChannelResponse {
  data: {
    _id: string
    channelName: string
    phoneNumber: string
    assignedTo: {
      _id: string
      name: string
      username: string
    }
    address: string
    avatarUrl: string
    createdAt: string
    updatedAt: string
    deletedAt?: string
  }[]
  total: number
}

/** @interface */
export interface GetSalesChannelDetailRequest {
  id: string
}

/** @interface */
export interface GetSalesChannelDetailResponse {
  _id: string
  channelName: string
  phoneNumber: string
  assignedTo: {
    _id: string
    name: string
    username: string
  }
  address: string
  avatarUrl: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface GetMyChannelResponse {
  channel: {
    _id: string
    channelName: string
    phoneNumber: string
    assignedTo: {
      _id: string
      name: string
      username: string
    }
    address: string
    avatarUrl: string
    createdAt: string
    updatedAt: string
    deletedAt?: string
  }
}

// -------------------- SALES PRICE ITEMS --------------------

/** @interface */
export interface CreateSalesPriceItemRequest {
  itemId: string
  price: number
}

/** @interface */
export interface CreateSalesPriceItemResponse {
  _id: string
  itemId: string
  price: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface UpdateSalesPriceItemRequest {
  price?: number
}

/** @interface */
export interface UpdateSalesPriceItemResponse {
  _id: string
  itemId: string
  price: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface GetSalesPriceItemsRequest {
  page: number
  limit: number
}

/** @interface */
export interface GetSalesPriceItemsResponse {
  data: {
    _id: string
    itemId: string
    price: number
    createdAt: string
    updatedAt: string
    deletedAt?: string
  }[]
  total: number
}

/** @interface */
export interface GetSalesPriceItemDetailRequest {
  id: string
}

/** @interface */
export interface GetSalesPriceItemDetailResponse {
  _id: string
  itemId: string
  price: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface DeleteSalesPriceItemRequest {
  id: string
}

// -------------------- SALES FUNNEL --------------------

/** @interface */
export interface CreateLeadRequest {
  name: string
  channel: string
  funnelSource: "ads" | "seeding" | "referral"
}

/** @interface */
export interface CreateLeadResponse {
  _id: string
  name: string
  province?: {
    _id: string
    code: string
    name: string
    createdAt: string
    updatedAt: string
  }
  phoneNumber?: string
  secondaryPhoneNumbers?: string[]
  psid: string
  channel: {
    _id: string
    channelName: string
  }
  user: {
    _id: string
    name: string
  }
  hasBuyed: boolean
  cost?: number
  stage: "lead" | "contacted" | "customer" | "closed"
  funnelSource: "ads" | "seeding" | "referral"
  fromSystem?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface MoveToContactedRequest {
  province: string
  phoneNumber: string
  address?: string
}

/** @interface */
export interface MoveToContactedResponse {
  _id: string
  name: string
  province: {
    _id: string
    code: string
    name: string
    createdAt: string
    updatedAt: string
  }
  phoneNumber: string
  secondaryPhoneNumbers?: string[]
  address?: string
  psid: string
  channel: {
    _id: string
    channelName: string
  }
  user: {
    _id: string
    name: string
  }
  hasBuyed: boolean
  cost?: number
  stage: "lead" | "contacted" | "customer" | "closed"
  funnelSource: "ads" | "seeding" | "referral"
  fromSystem?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface UpdateStageRequest {
  stage: "lead" | "contacted" | "customer" | "closed"
}

/** @interface */
export interface UpdateFunnelInfoRequest {
  name?: string
  province?: string
  phoneNumber?: string
  secondaryPhoneNumbers?: string[]
  address?: string
  channel?: string
  hasBuyed?: boolean
  funnelSource?: "ads" | "seeding" | "referral"
  fromSystem?: boolean
}

/** @interface */
export interface UpdateFunnelInfoResponse {
  _id: string
  name: string
  province: {
    _id: string
    code: string
    name: string
    createdAt: string
    updatedAt: string
  }
  phoneNumber: string
  secondaryPhoneNumbers?: string[]
  address?: string
  psid: string
  channel: {
    _id: string
    channelName: string
  }
  user: {
    _id: string
    name: string
  }
  hasBuyed: boolean
  cost?: number
  stage: "lead" | "contacted" | "customer" | "closed"
  funnelSource: "ads" | "seeding" | "referral"
  fromSystem?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface GetFunnelByIdRequest {
  id: string
}

/** @interface */
export interface GetFunnelByIdResponse {
  _id: string
  name: string
  province: {
    _id: string
    code: string
    name: string
    createdAt: string
    updatedAt: string
  }
  phoneNumber: string
  secondaryPhoneNumbers?: string[]
  address?: string
  psid: string
  channel: {
    _id: string
    channelName: string
  }
  user: {
    _id: string
    username: string
    name: string
  }
  hasBuyed: boolean
  cost?: number
  stage: "lead" | "contacted" | "customer" | "closed"
  funnelSource: "ads" | "seeding" | "referral"
  fromSystem?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface SearchFunnelRequest {
  stage?: "lead" | "contacted" | "customer" | "closed"
  channel?: string
  province?: string
  user?: string
  rank?: "gold" | "silver" | "bronze"
  searchText?: string
  noActivityDays?: number
  funnelSource?: "ads" | "seeding" | "referral"
  deleted?: boolean
  page: number
  limit: number
}

/** @interface */
export interface SearchFunnelResponse {
  data: {
    _id: string
    name: string
    province: {
      _id: string
      code: string
      name: string
      createdAt: string
      updatedAt: string
    }
    phoneNumber: string
    secondaryPhoneNumbers?: string[]
    psid: string
    channel: {
      _id: string
      channelName: string
    }
    user: {
      _id: string
      name: string
    }
    hasBuyed: boolean
    cost?: number
    stage: "lead" | "contacted" | "customer" | "closed"
    totalIncome: number
    rank: "gold" | "silver" | "bronze"
    funnelSource: "ads" | "seeding" | "referral"
    fromSystem?: boolean
    createdAt: string
    updatedAt: string
    deletedAt?: string
  }[]
  total: number
}

/** @interface */
export interface GetSalesFunnelByPsidRequest {
  psid: string
}

/** @interface */
export interface GetSalesFunnelByPsidResponse {
  _id: string
  name: string
  province: {
    _id: string
    code: string
    name: string
    createdAt: string
    updatedAt: string
  }
  phoneNumber: string
  secondaryPhoneNumbers?: string[]
  psid: string
  channel: {
    _id: string
    channelName: string
  }
  user: {
    _id: string
    name: string
  }
  hasBuyed: boolean
  cost?: number
  stage: "lead" | "contacted" | "customer" | "closed"
  totalIncome: number
  rank: "gold" | "silver" | "bronze"
  funnelSource: "ads" | "seeding" | "referral"
  fromSystem?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface UpdateFunnelCostRequest {
  cost: number
}

/** @interface */
export interface UpdateFunnelCostResponse {
  _id: string
  name: string
  facebook: string
  province: {
    _id: string
    code: string
    name: string
    createdAt: string
    updatedAt: string
  }
  phoneNumber: string
  secondaryPhoneNumbers?: string[]
  psid: string
  channel: {
    _id: string
    channelName: string
  }
  user: {
    _id: string
    name: string
  }
  hasBuyed: boolean
  cost?: number
  stage: "lead" | "contacted" | "customer" | "closed"
  totalIncome: number
  rank: "gold" | "silver" | "bronze"
  funnelSource: "ads" | "seeding" | "referral"
  fromSystem?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface UpdateFunnelResponsibleUserRequest {
  userId: string
}

/** @interface */
export interface UpdateFunnelResponsibleUserResponse {
  _id: string
  name: string
  facebook: string
  province: {
    _id: string
    code: string
    name: string
    createdAt: string
    updatedAt: string
  }
  phoneNumber: string
  psid: string
  channel: {
    _id: string
    channelName: string
  }
  user: {
    _id: string
    name: string
  }
  hasBuyed: boolean
  cost?: number
  stage: "lead" | "contacted" | "customer" | "closed"
  totalIncome: number
  rank: "gold" | "silver" | "bronze"
  funnelSource: "ads" | "seeding" | "referral"
  fromSystem?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface CheckPermissionOnFunnelRequest {
  id: string
}

/** @interface */
export interface CheckPermissionOnFunnelResponse {
  hasPermission: boolean
  isAdmin: boolean
  isResponsible: boolean
}

/** @interface */
export interface GetFunnelByUserRequest {
  limit: number
}

/** @interface */
export interface GetFunnelByUserResponse {
  data: {
    _id: string
    name: string
    province: {
      _id: string
      code: string
      name: string
      createdAt: string
      updatedAt: string
    }
    phoneNumber: string
    secondaryPhoneNumbers?: string[]
    address?: string
    psid: string
    channel: {
      _id: string
      channelName: string
    }
    user: {
      _id: string
      name: string
    }
    hasBuyed: boolean
    cost?: number
    stage: "lead" | "contacted" | "customer" | "closed"
    funnelSource: "ads" | "seeding" | "referral"
    fromSystem?: boolean
    createdAt: string
    updatedAt: string
    deletedAt?: string
  }[]
}

export interface DeleteFunnelRequest {
  id: string
}

export interface RestoreFunnelRequest {
  id: string
}

// -------------------- SALES ORDERS --------------------

/** @interface */
export interface CreateSalesOrderRequest {
  salesFunnelId: string
  items: { code: string; quantity: number; note?: string }[]
  storage: "position_HaNam" | "position_MKT"
  date: Date
  orderDiscount?: number
  otherDiscount?: number
  deposit?: number
}

/** @interface */
export interface CreateSalesOrderResponse {
  _id: string
  salesFunnelId: string
  items: {
    code: string
    name: string
    price: number
    quantity: number
    area?: number
    mass?: number
    specification?: string
    size?: string
    note?: string
  }[]
  returning: boolean
  shippingCode?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
  storage: "position_HaNam" | "position_MKT"
  cost?: number
  date: string
  total: number
  tax?: number
  shippingCost?: number
  deposit?: number
  orderDiscount?: number
  otherDiscount?: number
  status: "draft" | "official"
  phoneNumber: string
  address: string
  province: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface UpdateSalesOrderItemsRequest {
  items?: {
    code: string
    quantity: number
    note?: string
  }[]
  orderDiscount?: number
  otherDiscount?: number
  deposit?: number
}

/** @interface */
export interface UpdateSalesOrderItemsResponse {
  _id: string
  salesFunnelId: {
    _id: string
    name: string
    province: {
      _id: string
      code: string
      name: string
      createdAt: string
      updatedAt: string
    }
    phoneNumber: string
    secondaryPhoneNumbers?: string[]
    address?: string
    psid: string
    channel: {
      _id: string
      channelName: string
    }
    user: {
      _id: string
      name: string
    }
    hasBuyed: boolean
    cost?: number
    stage: "lead" | "contacted" | "customer" | "closed"
    funnelSource: "ads" | "seeding" | "referral"
    createdAt: string
    updatedAt: string
  }
  items: {
    code: string
    name: string
    price: number
    quantity: number
    area?: number
    mass?: number
    specification?: string
    size?: string
    note?: string
  }[]
  returning: boolean
  shippingCode?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
  storage: "position_HaNam" | "position_MKT"
  cost?: number
  date: string
  total: number
  tax?: number
  shippingCost?: number
  deposit?: number
  orderDiscount?: number
  otherDiscount?: number
  status: "draft" | "official"
  phoneNumber: string
  address: string
  province: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface UpdateShippingInfoRequest {
  shippingCode?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
  tax?: number
  shippingCost?: number
}

/** @interface */
export interface UpdateShippingInfoResponse {
  _id: string
  salesFunnelId: {
    _id: string
    name: string
    province: {
      _id: string
      code: string
      name: string
      createdAt: string
      updatedAt: string
    }
    phoneNumber: string
    secondaryPhoneNumbers?: string[]
    address?: string
    psid: string
    channel: {
      _id: string
      channelName: string
    }
    user: {
      _id: string
      name: string
    }
    hasBuyed: boolean
    cost?: number
    stage: "lead" | "contacted" | "customer" | "closed"
    funnelSource: "ads" | "seeding" | "referral"
    createdAt: string
    updatedAt: string
  }
  items: {
    code: string
    name: string
    price: number
    quantity: number
    area?: number
    mass?: number
    specification?: string
    size?: string
    note?: string
  }[]
  returning: boolean
  shippingCode?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
  storage: "position_HaNam" | "position_MKT"
  cost?: number
  date: string
  total: number
  tax?: number
  shippingCost?: number
  deposit?: number
  discount?: number
  status: "draft" | "official"
  phoneNumber: string
  address: string
  province: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface GetSalesOrderByIdRequest {
  id: string
}

/** @interface */
export interface GetSalesOrderByIdResponse {
  _id: string
  salesFunnelId: {
    _id: string
    name: string
    phoneNumber: string
    secondaryPhoneNumbers?: string[]
    psid: string
    channel: {
      _id: string
      channelName: string
    }
    user: {
      _id: string
      name: string
    }
    hasBuyed: boolean
    cost?: number
    stage: "lead" | "contacted" | "customer" | "closed"
    funnelSource: "ads" | "seeding" | "referral"
    createdAt: string
    updatedAt: string
  }
  items: {
    code: string
    name: string
    price: number
    quantity: number
    area?: number
    mass?: number
    specification?: string
    size?: string
    source?: "inside" | "outside"
    factory?:
      | "candy"
      | "manufacturing"
      | "position_MongCai"
      | "jelly"
      | "import"
    note?: string
  }[]
  returning: boolean
  shippingCode?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
  storage: "position_HaNam" | "position_MKT"
  cost?: number
  date: string
  total: number
  orderDiscount?: number
  otherDiscount?: number
  deposit?: number
  tax?: number
  shippingCost?: number
  status: "draft" | "official"
  phoneNumber: string
  address: string
  province: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface DeleteSalesOrderRequest {
  id: string
}

/** @interface */
export interface SearchSalesOrderRequest {
  salesFunnelId?: string
  returning?: boolean
  startDate?: string
  endDate?: string
  userId?: string
  searchText?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
  status?: "draft" | "official"
  rank?: "gold" | "silver" | "bronze"
  channelId?: string
  page: number
  limit: number
}

/** @interface */
export interface ExportXlsxSalesOrderRequest {
  salesFunnelId?: string
  returning?: boolean
  startDate?: string
  endDate?: string
  searchText?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
  status?: "draft" | "official"
  page: number
  limit: number
}

/** @interface */
export interface SearchSalesOrderResponse {
  data: {
    _id: string
    salesFunnelId: {
      _id: string
      name: string
      phoneNumber: string
      secondaryPhoneNumbers?: string[]
      psid: string
      channel: {
        _id: string
        channelName: string
      }
      user: {
        _id: string
        name: string
      }
      hasBuyed: boolean
      cost?: number
      stage: "lead" | "contacted" | "customer" | "closed"
      funnelSource: "ads" | "seeding" | "referral"
      createdAt: string
      updatedAt: string
    }
    items: {
      code: string
      name: string
      price: number
      quantity: number
      area?: number
      mass?: number
      specification?: string
      size?: string
      source?: "inside" | "outside"
      factory?:
        | "candy"
        | "manufacturing"
        | "position_MongCai"
        | "jelly"
        | "import"
      note?: string
    }[]
    returning: boolean
    shippingCode?: string
    shippingType?: "shipping_vtp" | "shipping_cargo"
    storage: "position_HaNam" | "position_MKT"
    cost?: number
    date: string
    total: number
    orderDiscount?: number
    otherDiscount?: number
    deposit?: number
    status: "draft" | "official"
    phoneNumber: string
    address: string
    province: {
      id: string
      name: string
    }
    createdAt: string
    updatedAt: string
  }[]
  total: number
}

/** @interface */
export interface GetProvincesResponse {
  provinces: {
    _id: string
    name: string
    code: string
    createdAt: string
    updatedAt: string
  }[]
}

/** @interface */
export interface PublicSearchUsersRequest {
  searchText?: string
  page: number
  limit: number
  role?: string
}

/** @interface */
export interface PublicSearchUsersResponse {
  data: {
    _id: string
    name: string
    roles?: string[]
  }[]
  total: number
}

/** @interface */
export interface UpdateSalesOrderTaxShippingRequest {
  tax: number
  shippingCost: number
}

/** @interface */
export interface UpdateSalesOrderTaxShippingResponse {
  _id: string
  salesFunnelId: string
  items: {
    code: string
    name: string
    price: number
    quantity: number
    massPerBox?: number
    areaPerBox?: number
    note?: string
  }[]
  returning: boolean
  shippingCode?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
  storage: "position_HaNam" | "position_MKT"
  cost?: number
  date: string
  total: number
  tax: number
  shippingCost: number
  status: "draft" | "official"
  phoneNumber: string
  address: string
  province: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface MoveSalesOrderToOfficialRequest {
  shippingCode: string
  shippingType: "shipping_vtp" | "shipping_cargo"
  tax: number
  shippingCost: number
}

/** @interface */
export interface MoveSalesOrderToOfficialResponse {
  _id: string
  salesFunnelId: string
  items: {
    code: string
    name: string
    price: number
    quantity: number
    note?: string
  }[]
  returning: boolean
  shippingCode?: string
  shippingType?: "shipping_vtp" | "shipping_cargo"
  storage: "position_HaNam" | "position_MKT"
  cost?: number
  date: string
  total: number
  tax: number
  shippingCost: number
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface GetOrdersByFunnelRequest {
  page: number
  limit: number
}

/** @interface */
export interface GetOrdersByFunnelResponse {
  data: {
    _id: string
    salesFunnelId: string
    items: {
      code: string
      name: string
      price: number
      quantity: number
      note?: string
    }[]
    returning: boolean
    shippingCode?: string
    shippingType?: "shipping_vtp" | "shipping_cargo"
    storage: "position_HaNam" | "position_MKT"
    cost?: number
    date: string
    total: number
    tax?: number
    shippingCost?: number
    status: "draft" | "official"
    phoneNumber: string
    address: string
    province: {
      id: string
      name: string
    }
    createdAt: string
    updatedAt: string
  }[]
  total: number
  daysSinceLastPurchase: number | null
}

// -------------------- META SERVICES --------------------
/** @interface */
export interface ListConversationsRequest {
  page: number
  limit: number
}

/** @interface */
export interface ListConversationsResponse {
  items: {
    conversationId: string
    updated_time: string
    link?: string
    user: {
      psid: string
      name?: string
      first_name?: string
      last_name?: string
      profile_pic?: string
    }
  }
  nextPage: number | null
}

/** @interface */
export interface ListConversationMessagesRequest {
  after: string | null
  before: string | null
}

/** @interface */
export interface ListConversationMessagesResponse {
  items: {
    id: string
    text?: string
    created_time: string
    from: {
      id: string
      name?: string
      isPage: boolean
    }
  }[]
  nextCursor: string
  prevCursor: string
}

/** @interface */
export interface SendMessageRequest {
  text: string
}

/** @interface */
export interface GetPsidByConversationIdResponse {
  psid: string
}

/** @interface */
export interface GetProfileByPsidRequest {
  psid: string
}

/** @interface */
export interface GetProfileByPsidResponse {
  first_name: string
  last_name: string
  profile_pic: string
}

/** @interface */
export interface GetConversationIdByPsidResponse {
  conversationId: string
}

// -------------------- SALES ITEMS --------------------

/** @interface */
export interface SearchSalesItemsRequest {
  searchText?: string
  factory?: string
  source?: string
  page: number
  limit: number
}

/** @interface */
export interface SearchSalesItemsResponse {
  data: {
    _id: string
    code: string
    name: {
      vn: string
      cn: string
    }
    factory?:
      | "candy"
      | "manufacturing"
      | "position_MongCai"
      | "jelly"
      | "import"
    price: number
    source?: "inside" | "outside"
    size?: string
    area?: number
    specification?: number
    mass?: number
    createdAt: string
    updatedAt: string
  }[]
  total: number
}

/** @interface */
export interface GetSalesItemsFactoriesResponse {
  data: {
    value: string
    label: string
  }[]
}

/** @interface */
export interface GetSalesItemsSourcesResponse {
  data: {
    value: string
    label: string
  }[]
}

/** @interface */
export interface CreateSalesItemRequest {
  code: string
  name: {
    vn: string
  }
  size?: string
  area?: number
  specification?: number
  mass?: number
  factory?: "candy" | "manufacturing" | "position_MongCai" | "jelly" | "import"
  price: number
  source?: "inside" | "outside"
}

/** @interface */
export interface CreateSalesItemResponse {
  _id: string
  code: string
  name: {
    vn: string
  }
  size?: string
  area?: number
  specification?: number
  mass?: number
  factory?: "candy" | "manufacturing" | "position_MongCai" | "jelly" | "import"
  price: number
  source?: "inside" | "outside"
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface UpdateSalesItemRequest {
  name?: {
    vn: string
  }
  size?: string
  area?: number
  specification?: number
  mass?: number
  factory?: "candy" | "manufacturing" | "position_MongCai" | "jelly" | "import"
  price?: number
  source?: "inside" | "outside"
}

/** @interface */
export interface UpdateSalesItemResponse {
  _id: string
  code: string
  name: {
    vn: string
  }
  size?: string
  area?: number
  specification?: number
  mass?: number
  factory?: "candy" | "manufacturing" | "position_MongCai" | "jelly" | "import"
  price: number
  source?: "inside" | "outside"
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface DeleteSalesItemRequest {
  id: string
}

/** @interface */
export interface GetSalesItemDetailRequest {
  id: string
}

/** @interface */
export interface GetSalesItemDetailResponse {
  _id: string
  code: string
  name: {
    vn: string
  }
  size?: string
  area?: number
  specification?: number
  mass?: number
  factory?: "candy" | "manufacturing" | "position_MongCai" | "jelly" | "import"
  price: number
  source?: "inside" | "outside"
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface GetSalesItemsQuantityByRangeRequest {
  startDate: Date
  endDate: Date
}

/** @interface */
export interface GetSalesItemsQuantityByRangeResponse {
  code: string
  totalQuantity: number
  orderCount: number
}

/** @interface */
export interface GetSalesItemsTopCustomersByRangeRequest {
  startDate: Date
  endDate: Date
}

/** @interface */
export interface GetSalesItemsTopCustomersByRangeResponse {
  code: string
  topCustomers: Array<{
    funnel: {
      _id: string
      name: string
      province: {
        _id: string
        code: string
        name: string
        createdAt: string
        updatedAt: string
      }
      phoneNumber: string
      secondaryPhoneNumbers?: string[]
      psid: string
      channel: {
        _id: string
        channelName: string
      }
      user: {
        _id: string
        name: string
      }
      hasBuyed: boolean
      cost?: number
      stage: "lead" | "contacted" | "customer" | "closed"
      createdAt: string
      updatedAt: string
    }
    totalQuantity: number
    orderCount: number
  }>
}

// -------------------- SALES DASHBOARD --------------------

/** @interface */
export interface GetSalesRevenueRequest {
  startDate: Date
  endDate: Date
}

/** @interface */
export interface GetSalesRevenueResponse {
  totalRevenue: number
  totalOrders: number
  revenueFromNewCustomers: number
  revenueFromReturningCustomers: number
  topItemsByRevenue: {
    code: string
    name: string
    revenue: number
  }[]
  topItemsByQuantity: {
    code: string
    name: string
    quantity: number
  }[]
  otherItemsRevenue: number
  revenueByChannel: {
    channelId: string
    channelName: string
    revenue: number
    orderCount: number
  }[]
  revenueByUser: {
    userId: string
    userName: string
    revenue: number
    orderCount: number
    ordersByCustomerType: {
      new: number
      returning: number
    }
    revenueByCustomerType: {
      new: number
      returning: number
    }
  }[]
}

/** @interface */
export interface GetMonthlyMetricsRequest {
  month: number
  year: number
}

/** @interface */
export interface GetMonthlyMetricsResponse {
  cac: number
  crr: number
  churnRate: number
  conversionRate: number
  avgDealSize: number
  salesCycleLength: number
  stageTransitions: {
    lead: number
    contacted: number
    customer: number
    closed: number
  }
}

// -------------------- SALES CUSTOMER RANKS --------------------

/** @interface */
export interface CreateSalesCustomerRankRequest {
  rank: "gold" | "silver" | "bronze"
  minIncome: number
}

/** @interface */
export interface CreateSalesCustomerRankResponse {
  _id: string
  rank: "gold" | "silver" | "bronze"
  minIncome: number
}

/** @interface */
export interface UpdateSalesCustomerRankRequest {
  rank?: "gold" | "silver" | "bronze"
  minIncome?: number
}

/** @interface */
export interface UpdateSalesCustomerRankResponse {
  _id: string
  rank: "gold" | "silver" | "bronze"
  minIncome: number
}

/** @interface */
export interface DeleteSalesCustomerRankRequest {
  id: string
}

/** @interface */
export interface GetSalesCustomerRankRequest {
  id: string
}

/** @interface */
export interface GetSalesCustomerRankResponse {
  _id: string
  rank: "gold" | "silver" | "bronze"
  minIncome: number
}

/** @interface */
export interface GetSalesCustomerRanksRequest {
  page: number
  limit: number
}

/** @interface */
export interface GetSalesCustomerRanksResponse {
  _id: string
  rank: "gold" | "silver" | "bronze"
  minIncome: number
}

// -------------------- SALES ACTIVITIES --------------------

/** @interface */
export interface CreateSalesActivityRequest {
  time: Date
  type: "call" | "message" | "other"
  note?: string
  salesFunnelId: string
}

/** @interface */
export interface CreateSalesActivityResponse {
  _id: string
  time: Date
  type: "call" | "message" | "other"
  note?: string
  salesFunnelId: {
    _id: string
    name: string
    phoneNumber: string
  }
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface UpdateSalesActivityRequest {
  time?: Date
  type?: "call" | "message" | "other"
  note?: string
}

/** @interface */
export interface UpdateSalesActivityResponse {
  _id: string
  time: Date
  type: "call" | "message" | "other"
  note?: string
  salesFunnelId: {
    _id: string
    name: string
    phoneNumber: string
  }
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface DeleteSalesActivityRequest {
  id: string
}

/** @interface */
export interface GetSalesActivityRequest {
  id: string
}

/** @interface */
export interface GetSalesActivityResponse {
  _id: string
  time: Date
  type: "call" | "message" | "other"
  note?: string
  salesFunnelId: {
    _id: string
    name: string
    phoneNumber: string
  }
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface GetSalesActivitiesRequest {
  salesFunnelId?: string
  page: number
  limit: number
  type?: "call" | "message" | "other"
}

/** @interface */
export interface GetSalesActivitiesResponse {
  data: {
    _id: string
    time: Date
    type: "call" | "message" | "other"
    note?: string
    salesFunnelId: {
      _id: string
      name: string
      phoneNumber: string
    }
    createdAt: string
    updatedAt: string
  }[]
  total: number
}

/** @interface */
export interface GetLatestActivityBySalesFunnelIdRequest {
  salesFunnelId: string
}

/** @interface */
export interface GetLatestActivityBySalesFunnelIdResponse {
  _id: string
  time: Date
  type: "call" | "message" | "other"
  note?: string
  salesFunnelId: {
    _id: string
    name: string
    phoneNumber: string
  }
  createdAt: string
  updatedAt: string
}

// -------------------- SALES TASKS --------------------

/** @interface */
export interface CreateSalesTaskRequest {
  salesFunnelId: string
  type: "call" | "message" | "other"
  note?: string
  deadline: Date
}

/** @interface */
export interface CreateSalesTaskResponse {
  _id: string
  salesFunnelId: {
    _id: string
    name: string
    phoneNumber: string
  }
  type: "call" | "message" | "other"
  assigneeId: {
    id: string
    name: string
    username: string
  }
  note?: string
  completed: boolean
  completedAt?: Date
  activityId?: string
  deadline: Date
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface UpdateSalesTaskRequest {
  type?: "call" | "message" | "other"
  note?: string
  deadline?: Date
}

/** @interface */
export interface UpdateSalesTaskResponse {
  _id: string
  salesFunnelId: {
    _id: string
    name: string
    phoneNumber: string
  }
  type: "call" | "message" | "other"
  assigneeId: {
    id: string
    name: string
    username: string
  }
  note?: string
  completed: boolean
  completedAt?: Date
  activityId?: string
  deadline: Date
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface DeleteSalesTaskRequest {
  id: string
}

/** @interface */
export interface GetSalesTaskRequest {
  id: string
}

/** @interface */
export interface GetSalesTaskResponse {
  _id: string
  salesFunnelId: {
    _id: string
    name: string
    phoneNumber: string
  }
  type: "call" | "message" | "other"
  assigneeId: {
    id: string
    name: string
    username: string
  }
  note?: string
  completed: boolean
  completedAt?: Date
  activityId?: string
  deadline: Date
  createdAt: string
  updatedAt: string
}

/** @interface */
export interface GetSalesTasksRequest {
  salesFunnelId?: string
  assigneeId?: string
  completed?: boolean
  page: number
  limit: number
}

/** @interface */
export interface GetSalesTasksResponse {
  data: {
    _id: string
    salesFunnelId: {
      _id: string
      name: string
      phoneNumber: string
    }
    type: "call" | "message" | "other"
    assigneeId: {
      id: string
      name: string
      username: string
    }
    note?: string
    completed: boolean
    completedAt?: Date
    activityId?: string
    deadline: Date
    createdAt: string
    updatedAt: string
  }[]
  total: number
}

/** @interface */
export interface CompleteTaskRequest {
  id: string
}

/** @interface */
export interface CompleteTaskResponse {
  _id: string
  salesFunnelId: {
    _id: string
    name: string
    phoneNumber: string
  }
  type: "call" | "message" | "other"
  assigneeId: {
    id: string
    name: string
    username: string
  }
  note?: string
  completed: boolean
  completedAt?: Date
  activityId?: string
  deadline: Date
  createdAt: string
  updatedAt: string
}

// -------------------- SALES DAILY REPORTS --------------------

/** @interface */
export interface GetRevenueForDateRequest {
  date: Date
  channelId: string
}

/** @interface */
export interface GetRevenueForDateResponse {
  revenue: number
  newFunnelRevenue: {
    ads: number
    other: number
  }
  returningFunnelRevenue: number
  newOrder: number
  returningOrder: number
  accumulatedRevenue: number
  accumulatedAdsCost: number
  accumulatedNewFunnelRevenue: {
    ads: number
    other: number
  }
}

/** @interface */
export interface CreateSalesDailyReportRequest {
  date: Date
  channel: string
  adsCost: number
  dateKpi: number
  revenue: number
  newFunnelRevenue: {
    ads: number
    other: number
  }
  returningFunnelRevenue: number
  newOrder: number
  returningOrder: number
  accumulatedRevenue: number
  accumulatedAdsCost: number
  accumulatedNewFunnelRevenue: {
    ads: number
    other: number
  }
}

/** @interface */
export interface CreateSalesDailyReportResponse {
  _id: string
  date: string
  channel: string
  adsCost: number
  dateKpi: number
  revenue: number
  newFunnelRevenue: {
    ads: number
    other: number
  }
  returningFunnelRevenue: number
  newOrder: number
  returningOrder: number
  accumulatedRevenue: number
  accumulatedAdsCost: number
  accumulatedNewFunnelRevenue: {
    ads: number
    other: number
  }
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface DeleteSalesDailyReportRequest {
  id: string
}

/** @interface */
export interface GetSalesDailyReportsByMonthRequest {
  month: number
  year: number
  channelId: string
  deleted?: boolean
}

/** @interface */
export interface GetSalesDailyReportsByMonthResponse {
  data: {
    _id: string
    date: string
    channel: string
    adsCost: number
    dateKpi: number
    revenue: number
    newFunnelRevenue: {
      ads: number
      other: number
    }
    returningFunnelRevenue: number
    newOrder: number
    returningOrder: number
    accumulatedRevenue: number
    accumulatedAdsCost: number
    accumulatedNewFunnelRevenue: {
      ads: number
      other: number
    }
    createdAt: string
    updatedAt: string
    deletedAt?: string
  }[]
  total: number
}

/** @interface */
export interface GetSalesDailyReportDetailRequest {
  id: string
}

/** @interface */
export interface GetSalesDailyReportDetailResponse {
  _id: string
  date: string
  channel: {
    _id: string
    channelName: string
    phoneNumber: string
  }
  adsCost: number
  dateKpi: number
  revenue: number
  newFunnelRevenue: {
    ads: number
    other: number
  }
  returningFunnelRevenue: number
  newOrder: number
  returningOrder: number
  accumulatedRevenue: number
  accumulatedAdsCost: number
  accumulatedNewFunnelRevenue: {
    ads: number
    other: number
  }
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** @interface */
export interface GetSalesMonthKpiRequest {
  date: Date
  channelId: string
}

/** @interface */
export interface GetSalesMonthKpiResponse {
  _id: string
  month: number
  year: number
  channel: {
    _id: string
    channelName: string
    phoneNumber: string
  }
  kpi: number
}

/** @interface */
export interface GetAccumulatedRevenueForMonthRequest {
  month: number
  year: number
  channelId: string
}

/** @interface */
export interface GetAccumulatedRevenueForMonthResponse {
  accumulatedRevenue: number
}

/** @interface */
export interface CreateSalesMonthKpiRequest {
  month: number
  year: number
  channel: string
  kpi: number
}

/** @interface */
export interface CreateSalesMonthKpiResponse {
  _id: string
  month: number
  year: number
  channel: {
    _id: string
    channelName: string
    phoneNumber: string
  }
  kpi: number
}

/** @interface */
export interface UpdateSalesMonthKpiRequest {
  month: number
  year: number
  channel: string
  kpi: number
}

/** @interface */
export interface UpdateSalesMonthKpiResponse {
  _id: string
  month: number
  year: number
  channel: {
    _id: string
    channelName: string
    phoneNumber: string
  }
  kpi: number
}

/** @interface */
export interface GetMonthKpisRequest {
  page: number
  limit: number
  channelId?: string
  month?: number
  year?: number
}

/** @interface */
export interface GetMonthKpisResponse {
  data: {
    _id: string
    month: number
    year: number
    channel: {
      _id: string
      channelName: string
      phoneNumber: string
    }
    kpi: number
  }[]
  total: number
}

/** @interface */
export interface GetMonthKpiDetailRequest {
  id: string
}

/** @interface */
export interface GetMonthKpiDetailResponse {
  _id: string
  month: number
  year: number
  channel: {
    _id: string
    channelName: string
    phoneNumber: string
  }
  kpi: number
}
