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

export interface GetIncomesByDateRequest {
  date: Date
  page: number
  limit: number
}

export interface GetIncomesByDateResponse {
  _id: string
  orderId: string
  customer: string
  province: string
  date: Date
  products: {
    creator?: string
    code: string
    name: string
    source: "affiliate" | "affiliate-ads" | "ads" | "other"
    quantity: number
    quotation: number
    price: number
    affliateAdsPercentage?: number
    sourceChecked: boolean
    content?: string
    box?: string
  }[]
}

export interface UpdateIncomesBoxRequest {
  date: Date
}

export interface GetTotalIncomesByMonthRequest {
  month: number
  year: number
}

export interface GetTotalIncomesByMonthResponse {
  total: number
}

export interface GetTotalQuantityByMonthRequest {
  month: number
  year: number
}

export interface GetTotalQuantityByMonthResponse {
  total: number
}

export interface GetKPIPercentageByMonthRequest {
  month: number
  year: number
}

export interface GetKPIPercentageByMonthResponse {
  percentage: number
}
