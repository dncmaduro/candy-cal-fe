import { CreateItemRequest, ItemResponse } from "./models"
import { callApi } from "./axios"

export const useItems = () => {
  const createItem = async (item: CreateItemRequest) => {
    return callApi<CreateItemRequest, ItemResponse>({
      path: `/v1/items`,
      method: "POST",
      data: item
    })
  }

  const updateItem = async (item: ItemResponse) => {
    return callApi<ItemResponse, ItemResponse>({
      path: `/v1/items`,
      method: "PUT",
      data: item
    })
  }

  const getAllItems = async () => {
    return callApi<never, ItemResponse[]>({
      path: `/v1/items`,
      method: "GET"
    })
  }

  const getItem = async (id: string) => {
    return callApi<never, ItemResponse[]>({
      path: `/v1/items?id=${id}`,
      method: "GET"
    })
  }

  const searchItems = async (searchText: string) => {
    return callApi<never, ItemResponse[]>({
      path: `/v1/items/search?searchText=${searchText}`,
      method: "GET"
    })
  }

  return {
    createItem,
    updateItem,
    getAllItems,
    getItem,
    searchItems
  }
}
