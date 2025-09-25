import {
  CreateItemRequest,
  CreateStorageItemRequest,
  ItemResponse,
  SearchStorageItemsRequest,
  SearchStorageItemResponse,
  RestoreStorageItemRequest
} from "./models"
import { callApi } from "./axios"
import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"

export const useItems = () => {
  const { accessToken } = useUserStore()

  const createItem = async (item: CreateItemRequest) => {
    return callApi<CreateItemRequest, ItemResponse>({
      path: `/v1/items`,
      method: "POST",
      data: item,
      token: accessToken
    })
  }

  const createStorageItem = async (item: CreateStorageItemRequest) => {
    return callApi<CreateStorageItemRequest, never>({
      path: `/v1/storageitems`,
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

  const updateStorageItem = async (item: SearchStorageItemResponse) => {
    return callApi<SearchStorageItemResponse, SearchStorageItemResponse>({
      path: `/v1/storageitems`,
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

  const getAllStorageItems = async () => {
    return callApi<never, SearchStorageItemResponse[]>({
      path: `/v1/storageitems`,
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

  const getStorageItem = async (id: string) => {
    return callApi<never, SearchStorageItemResponse>({
      path: `/v1/storageitems/item?id=${id}`,
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

  const searchStorageItems = async (req: SearchStorageItemsRequest) => {
    const query = toQueryString(req)

    return callApi<never, SearchStorageItemResponse[]>({
      path: `/v1/storageitems/search?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const deleteItem = async (id: string) => {
    return callApi<never, never>({
      path: `/v1/items/${id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const deleteStorageItem = async (id: string) => {
    return callApi<never, never>({
      path: `/v1/storageitems/${id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const restoreStorageItem = async (req: RestoreStorageItemRequest) => {
    return callApi<RestoreStorageItemRequest, never>({
      path: `/v1/storageitems/${req.id}/restore`,
      method: "POST",
      token: accessToken
    })
  }

  return {
    createItem,
    createStorageItem,
    updateItem,
    updateStorageItem,
    getAllItems,
    getAllStorageItems,
    getItem,
    getStorageItem,
    searchItems,
    searchStorageItems,
    deleteItem,
    deleteStorageItem,
    restoreStorageItem
  }
}
