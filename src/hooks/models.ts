export interface CreateItemRequest {
  name: string
  note?: string
  variants: string[]
}

export interface CreateStorageItemRequest {
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
}

export interface ItemResponse {
  _id: string
  name: string
  note?: string
  variants: string[]
}

export interface StorageItemResponse {
  _id: string
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
  code: string
  note?: string
}

export interface CreateProductRequest {
  name: string
  items: {
    _id: string
    quantity: number
  }[]
}

export interface ProductResponse {
  _id: string
  name: string
  items: {
    _id: string
    quantity: number
  }[]
}

export interface CreateComboRequest {
  name: string
  products: {
    _id: string
    quantity: number
  }[]
}

export interface ComboResponse {
  _id: string
  name: string
  products: {
    _id: string
    quantity: number
  }[]
}

export interface CalCombosRequest {
  products: {
    _id: string
    quantity: number
  }[]
  quantity: number
}

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

export interface CalItemsRequest {
  products: {
    _id: string
    quantity: number
    customers: number
  }[]
}

export interface CalFileRequest {
  file: Express.Multer.File
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface CheckTokenRequest {
  accessToken: string
}

export interface CheckTokenResponse {
  valid: boolean
}

/** @deprecated */
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

export interface GetLogsRequest {
  page: number
  limit: number
}

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

export interface GetLogsResponse {
  data: Log[]
  total: number
}

export interface GetLogsRangeRequest {
  startDate: string
  endDate: string
}

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

export interface GetMeResponse {
  username: string
  name: string
  role: string
  avatarUrl?: string
  _id: string
}

export interface GetStorageLogsRequest {
  page: number
  limit: number
  startDate?: string
  endDate?: string
  status?: string
  tag?: string
  itemId?: string
}

export interface GetStorageLogsResponse {
  data: {
    _id: string
    item: {
      _id: string
      quantity: number
    }
    note?: string
    status: string
    date: Date
    tag?: string
    itemId?: string
  }[]
  total: number
}

export interface CreateStorageLogRequest {
  item: {
    _id: string
    quantity: number
  }
  note?: string
  status: string
  date: Date
  tag?: string
}

export interface CreateStorageLogResponse {
  item: {
    _id: string
    quantity: number
  }
  note?: string
  status: string
  date: Date
  tag?: string
  _id: string
}

export interface UpdateStorageLogRequest {
  item: {
    _id: string
    quantity: number
  }
  note?: string
  status: string
  date: Date
  tag?: string
}

export interface UpdateStorageLogResponse {
  item: {
    _id: string
    quantity: number
  }
  note?: string
  status: string
  date: Date
  tag?: string
  _id: string
}

export interface GetStorageLogsByMonthRequest {
  year: number
  month: number
  tag?: string
}

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

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  message: string
}

export interface UpdateAvatarRequest {
  avatarUrl: string
}

export interface UpdateAvatarResponse {
  message: string
}

export interface UpdateUserRequest {
  name: string
}

export interface UpdateUserResponse {
  message: string
}

export interface CreateDeliveredRequestRequest {
  items: {
    _id: string
    quantity: number
  }[]
  note?: string
  date: Date
}

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

export interface CreateDeliveredRequestCommentRequest {
  requestId: string
  comment: {
    userId: string
    name: string
    text: string
    date: Date
  }
}

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

export interface AcceptDeliveredRequestRequest {
  requestId: string
}

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

export interface SearchDeliveredRequestsRequest {
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

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

export interface GetDeliveredRequestRequest {
  requestId: string
}

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

export interface Notification {
  _id: string
  title: string
  content: string
  createdAt: Date
  read: boolean
  type: string
  link?: string
}

export interface GetNotificationsRequest {
  page: number
}

export interface GetNotificationsResponse {
  notifications: Notification[]
  hasMore: boolean
}

export interface UndoAcceptDeliveredRequestRequest {
  requestId: string
}

export interface CreateReadyComboRequest {
  products: {
    _id: string
    quantity: number
  }[]
  isReady: boolean
  note?: string
}

export interface ReadyComboResponse {
  _id: string
  products: {
    _id: string
    quantity: number
  }[]
  isReady: boolean
  note?: string
}

export interface UpdateReadyComboRequest {
  products: {
    _id: string
    quantity: number
  }[]
  isReady: boolean
  note?: string
}

export interface SearchCombosRequest {
  searchText?: string
  isReady?: boolean
}

export interface LandingRequest {
  page: number
  pageSize: number
}

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

export interface GetOrderLogsRequest {
  page: number
  limit: number
}

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

export interface OrderLogProduct {
  name: string
  quantity: number
}

export interface OrderLogOrder {
  products: OrderLogProduct[]
  quantity: number
}

export interface OrderLogSession {
  items: OrderLogItem[]
  orders: OrderLogOrder[]
}

export interface GetOrderLogsResponse {
  data: {
    morning: OrderLogSession
    afternoon?: OrderLogSession
    date: string
    updatedAt: string
  }[]
  total: number
}

export interface CreateLogSessionRequest {
  date: Date
  items: OrderLogItem[]
  orders: OrderLogOrder[]
  session: "morning" | "afternoon"
}

export interface CreateLogSessionResponse {
  morning: OrderLogSession
  afternoon?: OrderLogSession
  date: string
  updatedAt: string
}

export interface GetOrderLogsByRangeRequest {
  startDate: string
  endDate: string
  session: "morning" | "afternoon" | "all"
}

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

export interface InsertIncomeRequest {
  type: "affiliate" | "ads" | "other"
  date: Date
}

export interface InsertIncomeResponse {
  success: true
}

export interface DeleteIncomeByDateRequest {
  date: Date
}

export interface UpdateAffiliateTypeResponse {
  success: true
}

export interface GetIncomesByDateRangeRequest {
  startDate: string
  endDate: string
  page: number
  limit: number
  orderId?: string
  productCode?: string
  productSource?: string
}

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

export interface UpdateIncomesBoxRequest {
  date: Date
}

export interface GetTotalIncomesByMonthRequest {
  month: number
  year: number
}

export interface GetTotalIncomesByMonthResponse {
  totalIncome: {
    live: number
    shop: number
  }
}

export interface GetTotalQuantityByMonthRequest {
  month: number
  year: number
}

export interface GetTotalQuantityByMonthResponse {
  totalQuantity: {
    live: number
    shop: number
  }
}

export interface GetKPIPercentageByMonthRequest {
  month: number
  year: number
}

export interface GetKPIPercentageByMonthResponse {
  KPIPercentage: {
    live: number
    shop: number
  }
}

export interface CreateMonthGoalRequest {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
}

export interface CreateMonthGoalResponse {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
}

export interface GetGoalsRequest {
  year?: number
}

export interface GetGoalsResponse {
  monthGoals: {
    month: number
    year: number
    liveStreamGoal: number
    shopGoal: number
    totalIncome: number
    totalQuantity: number
    KPIPercentage: number
  }[]
  total: number
}

export interface GetGoalRequest {
  month: number
  year: number
}

export interface GetGoalResponse {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
}

export interface UpdateGoalRequest {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
}

export interface UpdateGoalResponse {
  month: number
  year: number
  liveStreamGoal: number
  shopGoal: number
}

export interface DeleteGoalRequest {
  month: number
  year: number
}

export interface CreatePackingRuleRequest {
  productCode: string
  requirements: {
    minQuantity: number | null
    maxQuantity: number | null
    packingType: string
  }[]
}

export interface CreatePackingRuleResponse {
  productCode: string
  requirements: {
    minQuantity: number | null
    maxQuantity: number | null
    packingType: string
  }[]
}

export interface UpdatePackingRuleRequest {
  requirements: {
    minQuantity: number | null
    maxQuantity: number | null
    packingType: string
  }[]
}

export interface UpdatePackingRuleResponse {
  productCode: string
  requirements: {
    minQuantity: number | null
    maxQuantity: number | null
    packingType: string
  }[]
}

export interface GetPackingRuleResponse {
  productCode: string
  requirements: {
    minQuantity: number | null
    maxQuantity: number | null
    packingType: string
  }[]
}

export interface SearchPackingRulesRequest {
  searchText?: string
  packingType?: string
}

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

export interface ExportXlsxIncomesRequest {
  startDate: string
  endDate: string
  orderId?: string
  productCode?: string
  productSource?: string
}

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

export interface GetSessionLogsRequest {
  page: number
  limit: number
}

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

export interface GetDailyLogsRequest {
  page: number
  limit: number
}

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

export interface GetDailyLogByDateRequest {
  date: Date
}

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

export interface GetSessionLogByIdRequest {
  id: string
}

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

export interface GetUnviewedCountResponse {
  count: number
}

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

export interface GetInformationSystemLogsRespomse {
  data: {
    label: string
    value: string
  }[]
}

export interface GetRangeStatsRequest {
  startDate: string
  endDate: string
}

export interface GetRangeStatsResponse {
  period: { startDate: Date; endDate: Date; days: number }
  current: {
    totalIncome: number
    liveIncome: number
    videoIncome: number
    sources: {
      ads: number
      affiliate: number
      affiliateAds: number
      other: number
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
  }
  changes?: {
    totalIncomePct: number
    liveIncomePct: number
    videoIncomePct: number
    sources: {
      adsPct: number
      affiliatePct: number
      affiliateAdsPct: number
      otherPct: number
    }
    ads: {
      liveAdsCostPct: number
      videoAdsCostPct: number
      liveAdsToLiveIncomePctDiff: number
      videoAdsToVideoIncomePctDiff: number
    }
  }
}

export interface GetTopCreatorsRequest {
  startDate: string
  endDate: string
}

export interface TopCreatorItem {
  creator: string
  totalIncome: number
  percentage: number
}

export interface GetTopCreatorsResponse {
  affiliate: TopCreatorItem[]
  affiliateAds: TopCreatorItem[]
}

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

export interface MarkTaskAsDoneRequest {
  code: string
}

export interface MarkTaskAsDoneResponse {
  updated: boolean
}

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

export interface GetAllTasksDefinitionsRequest {
  limit?: number
  page?: number
}

export interface GetAllTasksDefinitionsResponse {
  data: TaskDefinition[]
  total: number
}

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

export interface CreateTaskDefinitionResponse {
  data: TaskDefinition
}

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

export interface UpdateTaskDefinitionResponse {
  data: TaskDefinition
}

export interface DeleteTaskDefinitionResponse {
  deleted: boolean
}

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

export interface GetAllAPIEndpointsResponse {
  data: APIEndpoint[]
}

export interface GenerateTasksRequest {
  date: Date
}

export interface GenerateTasksResponse {
  data: {
    date: string
    tasksCreated: number
  }
}

export interface GetAllUsersTasksRequest {
  date: Date
}

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

export interface GetUserTasksRequest {
  date: Date
}

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

export interface SystemLogsOptionsResponse {
  data: {
    label: string
    value: string
  }[]
}

export interface GetTotalLiveAndVideoIncomeByMonthRequest {
  month: number
  year: number
}

export interface GetTotalLiveAndVideoIncomeByMonthResponse {
  totalIncome: {
    live: number
    video: number
  }
}

export interface GetAdsCostSplitByMonthRequest {
  month: number
  year: number
}

export interface GetAdsCostSplitByMonthResponse {
  liveAdsCost: number
  videoAdsCost: number
  percentages: { liveAdsToLiveIncome: number; videoAdsToVideoIncome: number }
  totalIncome: { live: number; video: number }
}

export interface CreateDailyAdsRequest {
  date: Date
  liveAdsCost: number
  videoAdsCost: number
}
