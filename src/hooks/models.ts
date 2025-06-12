export interface CreateItemRequest {
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
    quantity: number
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
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
  }[]
  orders: {
    products: {
      name: string
      quantity: number
    }[]
    quantity: number
  }[]
}

export interface GetMeResponse {
  username: string
  name: string
  role: string
  avatarUrl?: string
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
