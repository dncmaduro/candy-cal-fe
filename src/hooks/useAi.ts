import { callApi } from "./axios"
import { useUserStore } from "../store/userStore"
import {
  AskAiRequest,
  AskAiResponse,
  AiUsageResponse,
  ClearAiConversationHistoryRequest,
  CreateAiFeedbackRequest,
  CreateAiFeedbackResponse,
  DeleteAiConversationRequest,
  GetAiConversationHistoryRequest,
  GetAiConversationHistoryResponse,
  ListAiFeedbackRequest,
  ListAiFeedbackResponse,
  ListAiConversationsRequest,
  ListAiConversationsResponse
} from "./models"
import { toQueryString } from "../utils/toQuery"

export const useAi = () => {
  const { accessToken } = useUserStore()

  const ask = async (req: AskAiRequest) => {
    return callApi<AskAiRequest, AskAiResponse>({
      path: `/v1/ai/ask`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const getUsage = async () => {
    return callApi<never, AiUsageResponse>({
      path: `/v1/ai/usage`,
      method: "GET",
      token: accessToken
    })
  }

  const listConversations = async (req: ListAiConversationsRequest = {}) => {
    const query = toQueryString(req)
    return callApi<never, ListAiConversationsResponse>({
      path: `/v1/ai/conversations${query ? `?${query}` : ""}`,
      method: "GET",
      token: accessToken
    })
  }

  const getConversationHistory = async (
    req: GetAiConversationHistoryRequest
  ) => {
    const query = toQueryString(req)
    return callApi<never, GetAiConversationHistoryResponse>({
      path: `/v1/ai/conversations/history${query ? `?${query}` : ""}`,
      method: "GET",
      token: accessToken
    })
  }

  const deleteConversation = async (req: DeleteAiConversationRequest) => {
    const query = toQueryString(req)
    return callApi<never, never>({
      path: `/v1/ai/conversations${query ? `?${query}` : ""}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const clearConversationHistory = async (
    req: ClearAiConversationHistoryRequest
  ) => {
    const query = toQueryString(req)
    return callApi<never, never>({
      path: `/v1/ai/conversations/history${query ? `?${query}` : ""}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const createFeedback = async (req: CreateAiFeedbackRequest) => {
    return callApi<CreateAiFeedbackRequest, CreateAiFeedbackResponse>({
      path: `/v1/ai/feedback`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const listFeedback = async (req: ListAiFeedbackRequest = {}) => {
    const query = toQueryString(req)
    return callApi<never, ListAiFeedbackResponse>({
      path: `/v1/ai/feedback${query ? `?${query}` : ""}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    ask,
    getUsage,
    listConversations,
    getConversationHistory,
    deleteConversation,
    clearConversationHistory,
    createFeedback,
    listFeedback
  }
}
