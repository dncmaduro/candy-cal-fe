import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateSalesOrderRequest,
  CreateSalesOrderResponse,
  DeleteSalesOrderRequest,
  ExportXlsxSalesOrderRequest,
  GetSalesOrderByIdResponse,
  SearchSalesOrderRequest,
  SearchSalesOrderResponse,
  UpdateSalesOrderItemsRequest,
  UpdateSalesOrderItemsResponse,
  UpdateShippingInfoRequest,
  UpdateShippingInfoResponse
} from "./models"

export const useSalesOrders = () => {
  const { accessToken } = useUserStore()

  const createSalesOrder = async (req: CreateSalesOrderRequest) => {
    return callApi<CreateSalesOrderRequest, CreateSalesOrderResponse>({
      path: `/v1/salesorders`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateSalesOrderItems = async (
    id: string,
    req: UpdateSalesOrderItemsRequest
  ) => {
    return callApi<UpdateSalesOrderItemsRequest, UpdateSalesOrderItemsResponse>(
      {
        path: `/v1/salesorders/${id}/items`,
        method: "PATCH",
        data: req,
        token: accessToken
      }
    )
  }

  const updateShippingInfo = async (
    id: string,
    req: UpdateShippingInfoRequest
  ) => {
    return callApi<UpdateShippingInfoRequest, UpdateShippingInfoResponse>({
      path: `/v1/salesorders/${id}/shipping`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  const deleteSalesOrder = async (req: DeleteSalesOrderRequest) => {
    return callApi<DeleteSalesOrderRequest, never>({
      path: `/v1/salesorders/${req.id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const getSalesOrderById = async (id: string) => {
    return callApi<never, GetSalesOrderByIdResponse>({
      path: `/v1/salesorders/${id}`,
      method: "GET",
      token: accessToken
    })
  }

  const searchSalesOrders = async (req: SearchSalesOrderRequest) => {
    const query = toQueryString(req)

    return callApi<never, SearchSalesOrderResponse>({
      path: `/v1/salesorders?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const exportXlsxSalesOrder = async (req: ExportXlsxSalesOrderRequest) => {
    const query = toQueryString(req)

    return callApi<never, Blob>({
      path: `/v1/salesorders/export/xlsx?${query}`,
      method: "GET",
      token: accessToken,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    })
  }

  return {
    createSalesOrder,
    updateSalesOrderItems,
    updateShippingInfo,
    deleteSalesOrder,
    getSalesOrderById,
    searchSalesOrders,
    exportXlsxSalesOrder
  }
}
