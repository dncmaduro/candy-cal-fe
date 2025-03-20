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
