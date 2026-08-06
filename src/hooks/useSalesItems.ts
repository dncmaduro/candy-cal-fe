import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateSalesItemRequest,
  CreateSalesItemResponse,
  ExportXlsxSalesItemsRequest,
  GetSalesItemsFactoriesResponse,
  GetSalesItemsSourcesResponse,
  GetSalesItemDetailResponse,
  GetSalesItemsQuantityByRangeRequest,
  GetSalesItemsQuantityByRangeResponse,
  GetSalesItemsTopCustomersByRangeRequest,
  GetSalesItemsTopCustomersByRangeResponse,
  SearchSalesItemsRequest,
  SearchSalesItemsResponse,
  UploadSalesInventoryResponse,
  GetDailySalesInventoryReportResponse,
  GetDailySalesInventoryReportHistoryResponse,
  UpdateSalesItemRequest,
  UpdateSalesItemResponse
} from "./models"
import { format } from "date-fns"

export const useSalesItems = () => {
  const { accessToken } = useUserStore()

  const uploadSalesItems = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return callApi<FormData, never>({
      path: `/v1/salesitems/upload`,
      data: formData,
      method: "POST",
      token: accessToken,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  }

  const downloadSalesItemsTemplate = async () => {
    return callApi<never, Blob>({
      path: `/v1/salesitems/upload/template`,
      method: "GET",
      token: accessToken,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      responseType: "blob"
    })
  }

  const uploadSalesInventory = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return callApi<FormData, UploadSalesInventoryResponse>({
      path: `/v1/salesitems/inventory/upload`,
      data: formData,
      method: "POST",
      token: accessToken,
      headers: { "Content-Type": "multipart/form-data" }
    })
  }

  const downloadSalesInventoryTemplate = async () => {
    return callApi<never, Blob>({
      path: `/v1/salesitems/inventory/template`,
      method: "GET",
      token: accessToken,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      responseType: "blob"
    })
  }

  const getDailySalesInventoryReport = async (date: Date) => {
    return callApi<never, GetDailySalesInventoryReportResponse>({
      path: `/v1/salesitems/inventory/daily-report?date=${format(date, "yyyy-MM-dd")}`,
      method: "GET",
      token: accessToken
    })
  }

  const getDailySalesInventoryReportHistory = async (
    month: number,
    year: number
  ) => {
    return callApi<never, GetDailySalesInventoryReportHistoryResponse>({
      path: `/v1/salesitems/inventory/daily-reports?month=${month}&year=${year}`,
      method: "GET",
      token: accessToken
    })
  }

  const downloadDailySalesInventoryReport = async (date: Date) => {
    return callApi<never, Blob>({
      path: `/v1/salesitems/inventory/daily-report/xlsx?date=${format(date, "yyyy-MM-dd")}`,
      method: "GET",
      token: accessToken,
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      responseType: "blob"
    })
  }

  const searchSalesItems = async (req: SearchSalesItemsRequest) => {
    const query = toQueryString(req)

    return callApi<never, SearchSalesItemsResponse>({
      path: `/v1/salesitems/search?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const exportSalesItemsToXlsx = async (req: ExportXlsxSalesItemsRequest) => {
    const query = toQueryString(req)
    const path = query
      ? `/v1/salesitems/export/xlsx?${query}`
      : `/v1/salesitems/export/xlsx`

    return callApi<never, Blob>({
      path,
      method: "GET",
      token: accessToken,
      headers: {
        "Content-Type": "application/json",
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      responseType: "blob"
    })
  }

  const getSalesItemsFactory = async () => {
    return callApi<never, GetSalesItemsFactoriesResponse>({
      path: `/v1/salesitems/factories`,
      method: "GET",
      token: accessToken
    })
  }

  const getSalesItemsSource = async () => {
    return callApi<never, GetSalesItemsSourcesResponse>({
      path: `/v1/salesitems/sources`,
      method: "GET",
      token: accessToken
    })
  }

  const createSalesItem = async (req: CreateSalesItemRequest) => {
    return callApi<CreateSalesItemRequest, CreateSalesItemResponse>({
      path: `/v1/salesitems/create`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateSalesItem = async (id: string, req: UpdateSalesItemRequest) => {
    return callApi<UpdateSalesItemRequest, UpdateSalesItemResponse>({
      path: `/v1/salesitems/${id}`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  const deleteSalesItem = async (id: string) => {
    return callApi<never, never>({
      path: `/v1/salesitems/${id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const getSalesItemDetail = async (id: string) => {
    return callApi<never, GetSalesItemDetailResponse>({
      path: `/v1/salesitems/${id}`,
      method: "GET",
      token: accessToken
    })
  }

  const getSalesItemsQuantityByRange = async (
    code: string,
    req: GetSalesItemsQuantityByRangeRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetSalesItemsQuantityByRangeResponse>({
      path: `/v1/salesitems/stats/${code}/quantity?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getSalesItemsTopCustomersByRange = async (
    code: string,
    req: GetSalesItemsTopCustomersByRangeRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetSalesItemsTopCustomersByRangeResponse>({
      path: `/v1/salesitems/stats/${code}/top-customers?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    uploadSalesItems,
    uploadSalesInventory,
    downloadSalesInventoryTemplate,
    getDailySalesInventoryReport,
    getDailySalesInventoryReportHistory,
    downloadDailySalesInventoryReport,
    downloadSalesItemsTemplate,
    searchSalesItems,
    exportSalesItemsToXlsx,
    getSalesItemsFactory,
    getSalesItemsSource,
    createSalesItem,
    updateSalesItem,
    deleteSalesItem,
    getSalesItemDetail,
    getSalesItemsQuantityByRange,
    getSalesItemsTopCustomersByRange
  }
}
