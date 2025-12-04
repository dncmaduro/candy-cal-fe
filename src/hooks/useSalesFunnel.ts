import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import {
  CheckPermissionOnFunnelRequest,
  CheckPermissionOnFunnelResponse,
  CreateLeadRequest,
  CreateLeadResponse,
  DeleteFunnelRequest,
  GetFunnelByIdRequest,
  GetFunnelByIdResponse,
  GetFunnelByUserRequest,
  GetFunnelByUserResponse,
  GetSalesFunnelByPsidRequest,
  GetSalesFunnelByPsidResponse,
  MoveToContactedRequest,
  MoveToContactedResponse,
  RestoreFunnelRequest,
  SearchFunnelRequest,
  SearchFunnelResponse,
  UpdateFunnelCostRequest,
  UpdateFunnelCostResponse,
  UpdateFunnelInfoRequest,
  UpdateFunnelInfoResponse,
  UpdateFunnelResponsibleUserRequest,
  UpdateFunnelResponsibleUserResponse,
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

  const updateFunnelResponsibleUser = async (
    id: string,
    req: UpdateFunnelResponsibleUserRequest
  ) => {
    return callApi<
      UpdateFunnelResponsibleUserRequest,
      UpdateFunnelResponsibleUserResponse
    >({
      path: `/v1/salesfunnel/${id}/user`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  const checkPermissionOnFunnel = async (
    req: CheckPermissionOnFunnelRequest
  ) => {
    return callApi<never, CheckPermissionOnFunnelResponse>({
      path: `/v1/salesfunnel/${req.id}/check-permission`,
      method: "GET",
      token: accessToken
    })
  }

  const uploadFunnelsByXlsx = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return callApi<FormData, never>({
      path: `/v1/salesfunnel/upload`,
      data: formData,
      method: "POST",
      token: accessToken,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  }

  const downloadFunnelTemplate = async () => {
    return callApi<never, Blob>({
      path: `/v1/salesfunnel/upload/template`,
      method: "GET",
      token: accessToken,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    })
  }

  const getFunnelByUser = async (
    userId: string,
    req: GetFunnelByUserRequest
  ) => {
    const query = toQueryString(req)

    return callApi<GetFunnelByUserRequest, GetFunnelByUserResponse>({
      path: `/v1/salesfunnel/user/${userId}?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const deleteFunnel = async (req: DeleteFunnelRequest) => {
    return callApi<never, never>({
      path: `/v1/salesfunnel/${req.id}/delete`,
      method: "PATCH",
      token: accessToken
    })
  }

  const restoreFunnel = async (req: RestoreFunnelRequest) => {
    return callApi<never, never>({
      path: `/v1/salesfunnel/${req.id}/restore`,
      method: "PATCH",
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
    updateFunnelCost,
    updateFunnelResponsibleUser,
    checkPermissionOnFunnel,
    uploadFunnelsByXlsx,
    downloadFunnelTemplate,
    getFunnelByUser,
    deleteFunnel,
    restoreFunnel
  }
}
