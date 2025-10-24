import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import {
  CreateSalesPriceItemRequest,
  CreateSalesPriceItemResponse,
  GetSalesPriceItemDetailResponse,
  GetSalesPriceItemsRequest,
  GetSalesPriceItemsResponse,
  UpdateSalesPriceItemRequest,
  UpdateSalesPriceItemResponse
} from "./models"
import { toQueryString } from "../utils/toQuery"

export const useSalesPriceItems = () => {
  const { accessToken } = useUserStore()

  const createSalesPriceItem = async (req: CreateSalesPriceItemRequest) => {
    return callApi<CreateSalesPriceItemRequest, CreateSalesPriceItemResponse>({
      path: `/v1/salespriceitems`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateSalesPriceItem = async (
    id: string,
    req: UpdateSalesPriceItemRequest
  ) => {
    return callApi<UpdateSalesPriceItemRequest, UpdateSalesPriceItemResponse>({
      path: `/v1/salespriceitems/${id}`,
      method: "PUT",
      data: req,
      token: accessToken
    })
  }

  const deleteSalesPriceItem = async (id: string) => {
    return callApi<never, never>({
      path: `/v1/salespriceitems/${id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const getSalesPriceItems = async (req: GetSalesPriceItemsRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetSalesPriceItemsResponse>({
      path: `/v1/salespriceitems?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getSalesPriceItemDetail = async (id: string) => {
    return callApi<never, GetSalesPriceItemDetailResponse>({
      path: `/v1/salespriceitems/${id}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    createSalesPriceItem,
    updateSalesPriceItem,
    deleteSalesPriceItem,
    getSalesPriceItems,
    getSalesPriceItemDetail
  }
}
