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
export interface StorageItemResponse {
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
  code: string
  note?: string
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
  createdAt: Date
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
}

/** @interface */
export interface GetIncomesByDateRangeResponse {
  incomes: {
    _id: string
    orderId: string
    customer: string
    province: string
    shippingProvider: string
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
}

/** @interface */
export interface CreateMonthGoalResponse {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
  liveAdsPercentageGoal: number
  shopAdsPercentageGoal: number
}

/** @interface */
export interface GetGoalsRequest {
  year?: number
}

/** @interface */
export interface GetGoalsResponse {
  monthGoals: {
    month: number
    year: number
    liveStreamGoal: number
    shopGoal: number
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
}

/** @interface */
export interface GetGoalResponse {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
  liveAdsPercentageGoal: number
  shopAdsPercentageGoal: number
}

/** @interface */
export interface UpdateGoalRequest {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
  liveAdsPercentageGoal: number
  shopAdsPercentageGoal: number
}

/** @interface */
export interface UpdateGoalResponse {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
  liveAdsPercentageGoal: number
  shopAdsPercentageGoal: number
}

/** @interface */
export interface DeleteGoalRequest {
  month: number
  year: number
}

/** @interface */
export interface CreatePackingRuleRequest {
  productCode: string
  requirements: {
    minQuantity: number | null
    maxQuantity: number | null
    packingType: string
  }[]
}

/** @interface */
export interface CreatePackingRuleResponse {
  productCode: string
  requirements: {
    minQuantity: number | null
    maxQuantity: number | null
    packingType: string
  }[]
}

/** @interface */
export interface UpdatePackingRuleRequest {
  requirements: {
    minQuantity: number | null
    maxQuantity: number | null
    packingType: string
  }[]
}

/** @interface */
export interface UpdatePackingRuleResponse {
  productCode: string
  requirements: {
    minQuantity: number | null
    maxQuantity: number | null
    packingType: string
  }[]
}

/** @interface */
export interface GetPackingRuleResponse {
  productCode: string
  requirements: {
    minQuantity: number | null
    maxQuantity: number | null
    packingType: string
  }[]
}

/** @interface */
export interface SearchPackingRulesRequest {
  searchText?: string
  packingType?: string
}

/** @interface */
export interface SearchPackingRulesResponse {
  rules: {
    productCode: string
    requirements: {
      minQuantity: number | null
      maxQuantity: number | null
      packingType: string
    }[]
  }[]
}

/** @interface */
export interface ExportXlsxIncomesRequest {
  startDate: string
  endDate: string
  orderId?: string
  productCode?: string
  productSource?: string
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
      videoAdsCost: number
      percentages: {
        liveAdsToLiveIncome: number
        videoAdsToVideoIncome: number
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
      videoAdsCostPct: number
      liveAdsToLiveIncomePctDiff: number
      videoAdsToVideoIncomePctDiff: number
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
  affiliate: TopCreatorItem[]
  affiliateAds: TopCreatorItem[]
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
  createdAt: Date
  deleted: boolean
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  name: string
  updatedAt: Date
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

/** @interface */
export interface GetTotalLiveAndVideoIncomeByMonthRequest {
  month: number
  year: number
}

/** @interface */
export interface GetTotalLiveAndVideoIncomeByMonthResponse {
  totalIncome: {
    beforeDiscount: { live: number; video: number }
    afterDiscount: { live: number; video: number }
  }
}

/** @interface */
export interface GetAdsCostSplitByMonthRequest {
  month: number
  year: number
}

/** @interface */
export interface GetAdsCostSplitByMonthResponse {
  liveAdsCost: number
  videoAdsCost: number
  percentages: { liveAdsToLiveIncome: number; videoAdsToVideoIncome: number }
  totalIncome: { live: number; video: number }
}

/** @interface */
export interface CreateDailyAdsRequest {
  date: Date
  liveAdsCost: number
  videoAdsCost: number
}

/** @interface */
export interface InsertIncomeAndUpdateSourceRequest {
  date: Date
}

/** @interface */
export interface InsertIncomeAndUpdateSourceResponse {
  success: true
}

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
    channel: string
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
