import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateAltRequestRequest,
  CreateAltRequestResponse,
  DeleteAltRequestRequest,
  GetAltRequestBySnapshotRequest,
  GetAltRequestBySnapshotResponse,
  SearchAltRequestsRequest,
  SearchAltRequestsResponse,
  UpdateAltRequestsRequest,
  UpdateAltRequestsResponse,
  UpdateAltRequestStatusRequest,
  UpdateAltRequestStatusResponse
} from "./models"

/**
 * Hook for livestream alt requests operations
 * Endpoints: /v1/livestreamaltrequests/*
 */
export const useLivestreamAltRequests = () => {
  const { accessToken } = useUserStore()

  const createAltRequest = async (req: CreateAltRequestRequest) => {
    return callApi<CreateAltRequestRequest, CreateAltRequestResponse>({
      method: "POST",
      path: `/v1/livestreamaltrequests`,
      data: req,
      token: accessToken
    })
  }

  const updateAltRequests = async (
    id: string,
    req: UpdateAltRequestsRequest
  ) => {
    return callApi<UpdateAltRequestsRequest, UpdateAltRequestsResponse>({
      method: "PUT",
      path: `/v1/livestreamaltrequests/${id}`,
      data: req,
      token: accessToken
    })
  }

  const getAltRequestBySnapshot = async (
    req: GetAltRequestBySnapshotRequest
  ) => {
    return callApi<never, GetAltRequestBySnapshotResponse>({
      method: "GET",
      path: `/v1/livestreamaltrequests/by-snapshot/${req.livestreamId}/${req.snapshotId}`,
      token: accessToken
    })
  }

  const updateAltRequestStatus = async (
    id: string,
    req: UpdateAltRequestStatusRequest
  ) => {
    return callApi<
      UpdateAltRequestStatusRequest,
      UpdateAltRequestStatusResponse
    >({
      method: "PUT",
      path: `/v1/livestreamaltrequests/${id}/status`,
      data: req,
      token: accessToken
    })
  }

  const deleteAltRequest = async (req: DeleteAltRequestRequest) => {
    return callApi<never, never>({
      method: "DELETE",
      path: `/v1/livestreamaltrequests/${req.id}`,
      token: accessToken
    })
  }

  const searchAltRequests = async (req: SearchAltRequestsRequest) => {
    const query = toQueryString(req)

    return callApi<never, SearchAltRequestsResponse>({
      method: "GET",
      path: `/v1/livestreamaltrequests/search?${query}`,
      token: accessToken
    })
  }

  return {
    createAltRequest,
    updateAltRequests,
    getAltRequestBySnapshot,
    updateAltRequestStatus,
    deleteAltRequest,
    searchAltRequests
  }
}
