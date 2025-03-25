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
  _id: string
  quantity: number
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
