import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreatePackingRuleRequest,
  CreatePackingRuleResponse,
  SearchPackingRulesRequest,
  SearchPackingRulesResponse,
  UpdatePackingRuleRequest,
  UpdatePackingRuleResponse
} from "./models"

export const usePackingRules = () => {
  const { accessToken } = useUserStore()

  const createRule = async (req: CreatePackingRuleRequest) => {
    return callApi<CreatePackingRuleRequest, CreatePackingRuleResponse>({
      path: `/v1/packingrules`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateRule = async (
    productCode: string,
    req: UpdatePackingRuleRequest
  ) => {
    return callApi<UpdatePackingRuleRequest, UpdatePackingRuleResponse>({
      path: `/v1/packingrules/${productCode}`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  const deleteRule = async (productCode: string) => {
    return callApi<never, never>({
      path: `/v1/packingrules/${productCode}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const getRule = async (productCode: string) => {
    return callApi<never, UpdatePackingRuleResponse>({
      path: `/v1/packingrules/${productCode}`,
      method: "GET",
      token: accessToken
    })
  }

  const searchRules = async (req: SearchPackingRulesRequest) => {
    const query = toQueryString(req)

    return callApi<SearchPackingRulesRequest, SearchPackingRulesResponse>({
      path: `/v1/packingrules?${query}`,
      method: "GET",
      data: req,
      token: accessToken
    })
  }

  return {
    createRule,
    updateRule,
    deleteRule,
    getRule,
    searchRules
  }
}
