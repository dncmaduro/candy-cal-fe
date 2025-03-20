import { callApi } from "./axios"
import { ComboResponse, CreateComboRequest } from "./models"

export const useCombos = () => {
  const createCombo = async (item: CreateComboRequest) => {
    return callApi<CreateComboRequest, ComboResponse[]>({
      path: `/v1/combos`,
      method: "POST",
      data: item
    })
  }

  const updateCombo = async (item: ComboResponse) => {
    return callApi<ComboResponse, ComboResponse>({
      path: `/v1/combos`,
      method: "PUT",
      data: item
    })
  }

  const getCombo = async (id: string) => {
    return callApi<never, ComboResponse>({
      path: `/v1/combos/combo?id=${id}`,
      method: "GET"
    })
  }

  const searchCombos = async (searchText: string) => {
    return callApi<never, ComboResponse[]>({
      path: `/v1/combos/search?searchText=${searchText}`,
      method: "GET"
    })
  }

  return { createCombo, updateCombo, getCombo, searchCombos }
}
