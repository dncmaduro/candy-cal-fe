import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateLivestreamChannelRequest,
  DeleteLivestreamChannelRequest,
  GetLivestreamChannelDetailResponse,
  SearchLivestreamChannelsRequest,
  SearchLivestreamChannelsResponse,
  UpdateLivestreamChannelRequest
} from "./models"

/**
 * Hook for livestream channels operations
 * Endpoints: /v1/livestreamchannels/*
 */
export const useLivestreamChannels = () => {
  const { accessToken } = useUserStore()

  const createLivestreamChannel = async (
    req: CreateLivestreamChannelRequest
  ) => {
    return callApi<CreateLivestreamChannelRequest, never>({
      method: "POST",
      path: `/v1/livestreamchannels`,
      data: req,
      token: accessToken
    })
  }

  const searchLivestreamChannels = async (
    req: SearchLivestreamChannelsRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, SearchLivestreamChannelsResponse>({
      method: "GET",
      path: `/v1/livestreamchannels/search?${query}`,
      token: accessToken
    })
  }

  const getLivestreamChannelDetail = async (id: string) => {
    return callApi<never, GetLivestreamChannelDetailResponse>({
      method: "GET",
      path: `/v1/livestreamchannels/${id}`,
      token: accessToken
    })
  }

  const updateLivestreamChannel = async (
    id: string,
    req: UpdateLivestreamChannelRequest
  ) => {
    return callApi<UpdateLivestreamChannelRequest, never>({
      method: "PUT",
      path: `/v1/livestreamchannels/${id}`,
      data: req,
      token: accessToken
    })
  }

  const deleteLivestreamChannel = async (
    req: DeleteLivestreamChannelRequest
  ) => {
    return callApi<never, never>({
      method: "DELETE",
      path: `/v1/livestreamchannels/${req.id}`,
      token: accessToken
    })
  }

  return {
    createLivestreamChannel,
    searchLivestreamChannels,
    getLivestreamChannelDetail,
    updateLivestreamChannel,
    deleteLivestreamChannel
  }
}
