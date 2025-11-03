import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import {
  CreateLeadRequest,
  CreateLeadResponse,
  GetFunnelByIdRequest,
  GetFunnelByIdResponse,
  GetSalesFunnelByPsidRequest,
  GetSalesFunnelByPsidResponse,
  MoveToContactedRequest,
  MoveToContactedResponse,
  SearchFunnelRequest,
  SearchFunnelResponse,
  UpdateFunnelCostRequest,
  UpdateFunnelCostResponse,
  UpdateFunnelInfoRequest,
  UpdateFunnelInfoResponse,
  UpdateStageRequest
} from "./models"
import { toQueryString } from "../utils/toQuery"

export const useSalesFunnel = () => {
  const { accessToken } = useUserStore()

  const createLead = async (req: CreateLeadRequest) => {
    return callApi<CreateLeadRequest, CreateLeadResponse>({
      path: `/v1/salesfunnel`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const moveToContacted = async (id: string, req: MoveToContactedRequest) => {
    return callApi<MoveToContactedRequest, MoveToContactedResponse>({
      path: `/v1/salesfunnel/${id}/contacted`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  const updateStage = async (id: string, req: UpdateStageRequest) => {
    return callApi<UpdateStageRequest, never>({
      path: `/v1/salesfunnel/${id}/stage`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  const updateFunnelInfo = async (id: string, req: UpdateFunnelInfoRequest) => {
    return callApi<UpdateFunnelInfoRequest, UpdateFunnelInfoResponse>({
      path: `/v1/salesfunnel/${id}`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  const getFunnelById = async (req: GetFunnelByIdRequest) => {
    return callApi<never, GetFunnelByIdResponse>({
      path: `/v1/salesfunnel/${req.id}`,
      method: "GET",
      token: accessToken
    })
  }

  const searchFunnel = async (req: SearchFunnelRequest) => {
    const query = toQueryString(req)

    return callApi<never, SearchFunnelResponse>({
      path: `/v1/salesfunnel?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getFunnelByPsid = async (req: GetSalesFunnelByPsidRequest) => {
    return callApi<never, GetSalesFunnelByPsidResponse>({
      path: `/v1/salesfunnel/psid/${req.psid}`,
      method: "GET",
      token: accessToken
    })
  }

  const updateFunnelCost = async (id: string, req: UpdateFunnelCostRequest) => {
    return callApi<UpdateFunnelCostRequest, UpdateFunnelCostResponse>({
      path: `/v1/salesfunnel/${id}/cost`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  return {
    createLead,
    moveToContacted,
    updateStage,
    updateFunnelInfo,
    getFunnelById,
    searchFunnel,
    getFunnelByPsid,
    updateFunnelCost
  }
}
