import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  GetConversationIdByPsidResponse,
  GetProfileByPsidRequest,
  GetProfileByPsidResponse,
  GetPsidByConversationIdResponse,
  ListConversationMessagesRequest,
  ListConversationMessagesResponse,
  ListConversationsRequest,
  ListConversationsResponse,
  SendMessageRequest
} from "./models"

export const useMetaServices = () => {
  const { accessToken } = useUserStore()

  const listConversations = async (req: ListConversationsRequest) => {
    const query = toQueryString(req)

    return callApi<never, ListConversationsResponse>({
      path: `/v1/meta/conversations?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const listConversationMessages = async (
    id: string,
    req: ListConversationMessagesRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, ListConversationMessagesResponse>({
      path: `/v1/meta/conversations/${id}/messages?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getPsidByConversationId = async (conversationId: string) => {
    return callApi<never, GetPsidByConversationIdResponse>({
      path: `/v1/meta/conversations/${conversationId}/psid`,
      method: "GET",
      token: accessToken
    })
  }

  const sendMessage = async (id: string, req: SendMessageRequest) => {
    return callApi<SendMessageRequest, never>({
      path: `/v1/meta/conversations/${id}/send`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const getProfileByPsid = async (req: GetProfileByPsidRequest) => {
    return callApi<never, GetProfileByPsidResponse>({
      path: `/v1/meta/profile/${req.psid}`,
      method: "GET",
      token: accessToken
    })
  }

  const getConversationIdByPsid = async (psid: string) => {
    return callApi<never, GetConversationIdByPsidResponse>({
      path: `/v1/meta/conversations/${psid}/conversationId`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    listConversations,
    listConversationMessages,
    getPsidByConversationId,
    sendMessage,
    getProfileByPsid,
    getConversationIdByPsid
  }
}
