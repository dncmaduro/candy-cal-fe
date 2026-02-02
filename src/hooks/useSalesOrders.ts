import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateSalesOrderRequest,
  CreateSalesOrderResponse,
  DeleteSalesOrderRequest,
  ExportXlsxSalesOrderByIdsRequest,
  ExportXlsxSalesOrderForAccountingRequest,
  ExportXlsxSalesOrderRequest,
  GetOrdersByFunnelRequest,
  GetOrdersByFunnelResponse,
  GetSalesOrderByIdResponse,
  MoveSalesOrderToOfficialRequest,
  MoveSalesOrderToOfficialResponse,
  SearchSalesOrderRequest,
  SearchSalesOrderResponse,
  UpdateSalesOrderDateRequest,
  UpdateSalesOrderDateResponse,
  UpdateSalesOrderItemsRequest,
  UpdateSalesOrderItemsResponse,
  UpdateSalesOrderTaxShippingRequest,
  UpdateSalesOrderTaxShippingResponse,
  UpdateShippingInfoRequest,
  UpdateShippingInfoResponse
} from "./models"

export const useSalesOrders = () => {
  const { accessToken } = useUserStore()

  const uploadSalesOrders = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return callApi<FormData, never>({
      path: `/v1/salesorders/upload`,
      data: formData,
      method: "POST",
      token: accessToken,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  }

  const downloadSalesOrdersTemplate = async () => {
    return callApi<never, Blob>({
      path: `/v1/salesorders/upload/template`,
      method: "GET",
      token: accessToken,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    })
  }

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
      path: `/v1/salesorders/${id}/shipping-tax`,
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

  const updateSalesOrderTaxShipping = async (
    id: string,
    req: UpdateSalesOrderTaxShippingRequest
  ) => {
    return callApi<
      UpdateSalesOrderTaxShippingRequest,
      UpdateSalesOrderTaxShippingResponse
    >({
      path: `/v1/salesorders/${id}/tax-shipping`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  const moveSalesOrderToOfficial = async (
    id: string,
    req: MoveSalesOrderToOfficialRequest
  ) => {
    return callApi<
      MoveSalesOrderToOfficialRequest,
      MoveSalesOrderToOfficialResponse
    >({
      path: `/v1/salesorders/${id}/convert-official`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  const getOrdersByFunnel = async (
    funnelId: string,
    req: GetOrdersByFunnelRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetOrdersByFunnelResponse>({
      path: `/v1/salesorders/funnel/${funnelId}?${query}`,
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
        // request body là JSON
        "Content-Type": "application/json",
        // response mong muốn là file excel
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      responseType: "blob"
    })
  }

  const exportXlsxSalesOrderForAccounting = async (
    req: ExportXlsxSalesOrderForAccountingRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, Blob>({
      path: `/v1/salesorders/export/xlsx/accounting?${query}`,
      method: "GET",
      token: accessToken,
      headers: {
        // request body là JSON
        "Content-Type": "application/json",
        // response mong muốn là file excel
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      responseType: "blob"
    })
  }

  const exportXlsxSalesOrderByIds = async (
    req: ExportXlsxSalesOrderByIdsRequest
  ) => {
    return callApi<ExportXlsxSalesOrderByIdsRequest, Blob>({
      path: `/v1/salesorders/export/xlsx/by-ids`,
      method: "POST",
      data: req,
      token: accessToken,
      headers: {
        // request body là JSON
        "Content-Type": "application/json",
        // response mong muốn là file excel
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      responseType: "blob" // thêm param này (xem mục 2)
    })
  }

  const updateSalesOrderDate = async (
    id: string,
    req: UpdateSalesOrderDateRequest
  ) => {
    return callApi<UpdateSalesOrderDateRequest, UpdateSalesOrderDateResponse>({
      path: `/v1/salesorders/${id}/date`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  return {
    uploadSalesOrders,
    downloadSalesOrdersTemplate,
    createSalesOrder,
    updateSalesOrderItems,
    updateShippingInfo,
    deleteSalesOrder,
    getSalesOrderById,
    searchSalesOrders,
    exportXlsxSalesOrder,
    exportXlsxSalesOrderForAccounting,
    updateSalesOrderTaxShipping,
    moveSalesOrderToOfficial,
    getOrdersByFunnel,
    exportXlsxSalesOrderByIds,
    updateSalesOrderDate
  }
}
