export interface CreateItemRequest {
  name: string
  quantityPerBox: number
}

export interface ItemResponse {
  _id: string
  name: string
  quantityPerBox: number
}
