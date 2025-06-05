export interface CreateItemRequest {
  name: string
  quantityPerBox: number
}

export interface ItemResponse {
  _id: string
  name: string
  quantityPerBox: number
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
