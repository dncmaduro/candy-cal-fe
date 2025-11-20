import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import {
  CreateSalesChannelRequest,
  CreateSalesChannelResponse,
  GetSalesChannelDetailResponse,
  SearchSalesChannelRequest,
  SearchSalesChannelResponse,
  UpdateSalesChannelRequest,
  UpdateSalesChannelResponse
} from "./models"
import { toQueryString } from "../utils/toQuery"

export const useSalesChannels = () => {
  const { accessToken } = useUserStore()

  const createSalesChannel = async (req: CreateSalesChannelRequest) => {
    return callApi<CreateSalesChannelRequest, CreateSalesChannelResponse>({
      path: `/v1/saleschannels`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateSalesChannel = async (
    id: string,
    req: UpdateSalesChannelRequest
  ) => {
    return callApi<UpdateSalesChannelRequest, UpdateSalesChannelResponse>({
      path: `/v1/saleschannels/${id}`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  const deleteSalesChannel = async (id: string) => {
    return callApi<never, never>({
      path: `/v1/saleschannels/${id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const searchSalesChannels = async (req: SearchSalesChannelRequest) => {
    const query = toQueryString(req)

    return callApi<never, SearchSalesChannelResponse>({
      path: `/v1/saleschannels?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getSalesChannelDetail = async (id: string) => {
    return callApi<never, GetSalesChannelDetailResponse>({
      path: `/v1/saleschannels/${id}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    createSalesChannel,
    updateSalesChannel,
    deleteSalesChannel,
    searchSalesChannels,
    getSalesChannelDetail
  }
}
