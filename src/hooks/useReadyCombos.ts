import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateReadyComboRequest,
  ReadyComboResponse,
  SearchCombosRequest,
  UpdateReadyComboRequest
} from "./models"

export const useReadyCombos = () => {
  const { accessToken } = useUserStore()

  const createCombo = async (req: CreateReadyComboRequest) => {
    return callApi<CreateReadyComboRequest, ReadyComboResponse>({
      path: `/v1/readycombos`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateCombo = async (comboId: string, req: UpdateReadyComboRequest) => {
    return callApi<UpdateReadyComboRequest, ReadyComboResponse>({
      path: `/v1/readycombos/${comboId}`,
      method: "PUT",
      data: req,
      token: accessToken
    })
  }

  const toggleReadyCombo = async (comboId: string) => {
    return callApi<never, ReadyComboResponse>({
      path: `/v1/readycombos/${comboId}/toggle`,
      method: "PATCH",
      token: accessToken
    })
  }

  const searchCombos = async (req: SearchCombosRequest) => {
    const query = toQueryString({
      searchText: req.searchText,
      isReady: req.isReady
    })

    return callApi<SearchCombosRequest, ReadyComboResponse[]>({
      path: `/v1/readycombos/search?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const deleteCombo = async (comboId: string) => {
    return callApi<never, never>({
      path: `/v1/readycombos/${comboId}`,
      method: "DELETE",
      token: accessToken
    })
  }

  return {
    createCombo,
    updateCombo,
    toggleReadyCombo,
    searchCombos,
    deleteCombo
  }
}
