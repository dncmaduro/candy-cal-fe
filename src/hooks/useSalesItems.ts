import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  GetSalesItemsFactoriesResponse,
  GetSalesItemsSourcesResponse,
  SearchSalesItemsRequest,
  SearchSalesItemsResponse
} from "./models"

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

  const searchSalesItems = async (req: SearchSalesItemsRequest) => {
    const query = toQueryString(req)

    return callApi<never, SearchSalesItemsResponse>({
      path: `/v1/salesitems/search?${query}`,
      method: "GET",
      token: accessToken
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

  return {
    uploadSalesItems,
    searchSalesItems,
    getSalesItemsFactory,
    getSalesItemsSource
  }
}
