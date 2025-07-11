import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  AcceptDeliveredRequestRequest,
  AcceptDeliveredRequestResponse,
  CreateDeliveredRequestCommentRequest,
  CreateDeliveredRequestRequest,
  GetDeliveredRequestRequest,
  GetDeliveredRequestResponse,
  SearchDeliveredRequestsRequest,
  SearchDeliveredRequestsResponse,
  UndoAcceptDeliveredRequestRequest
} from "./models"

export const useDeliveredRequests = () => {
  const { accessToken } = useUserStore()

  const createDeliveredRequest = async (req: CreateDeliveredRequestRequest) => {
    return callApi<CreateDeliveredRequestRequest, any>({
      path: `/v1/deliveredrequests`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const createDeliveredRequestComment = async (
    req: CreateDeliveredRequestCommentRequest
  ) => {
    return callApi<CreateDeliveredRequestCommentRequest, any>({
      path: `/v1/deliveredrequests/${req.requestId}/comments`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const acceptDeliveredRequest = async (req: AcceptDeliveredRequestRequest) => {
    return callApi<
      AcceptDeliveredRequestRequest,
      AcceptDeliveredRequestResponse
    >({
      path: `/v1/deliveredrequests/${req.requestId}/accept`,
      method: "PATCH",
      token: accessToken,
      data: req
    })
  }

  const searchDeliveredRequests = async (
    req: SearchDeliveredRequestsRequest
  ) => {
    const query = toQueryString({
      page: req.page,
      limit: req.limit,
      startDate: req.startDate,
      endDate: req.endDate
    })
    return callApi<never, SearchDeliveredRequestsResponse>({
      path: `/v1/deliveredrequests/search?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getDeliveredRequest = async (req: GetDeliveredRequestRequest) => {
    return callApi<never, GetDeliveredRequestResponse>({
      path: `/v1/deliveredrequests/${req.requestId}`,
      method: "GET",
      token: accessToken
    })
  }

  const undoAcceptRequest = async (req: UndoAcceptDeliveredRequestRequest) => {
    return callApi<never, any>({
      path: `/v1/deliveredrequests/${req.requestId}/undo-request`,
      method: "PATCH",
      token: accessToken
    })
  }

  return {
    createDeliveredRequest,
    createDeliveredRequestComment,
    acceptDeliveredRequest,
    searchDeliveredRequests,
    getDeliveredRequest,
    undoAcceptRequest
  }
}
