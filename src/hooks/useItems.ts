import { CreateItemRequest, ItemResponse } from "./models"
import { callApi } from "./axios"
import { useUserStore } from "../store/userStore"

export const useItems = () => {
  const { accessToken } = useUserStore()

  const createItem = async (item: CreateItemRequest) => {
    console.log(accessToken)
    return callApi<CreateItemRequest, ItemResponse>({
      path: `/v1/items`,
      method: "POST",
      data: item,
      token: accessToken
    })
  }

  const updateItem = async (item: ItemResponse) => {
    return callApi<ItemResponse, ItemResponse>({
      path: `/v1/items`,
      method: "PUT",
      data: item,
      token: accessToken
    })
  }

  const getAllItems = async () => {
    return callApi<never, ItemResponse[]>({
      path: `/v1/items`,
      method: "GET",
      token: accessToken
    })
  }

  const getItem = async (id: string) => {
    return callApi<never, ItemResponse>({
      path: `/v1/items/item?id=${id}`,
      method: "GET",
      token: accessToken
    })
  }

  const searchItems = async (searchText: string) => {
    return callApi<never, ItemResponse[]>({
      path: `/v1/items/search?searchText=${searchText}`,
      method: "GET",
      token: accessToken
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
