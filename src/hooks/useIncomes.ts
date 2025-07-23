import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  DeleteIncomeByDateRequest,
  GetIncomesByDateRequest,
  GetIncomesByDateResponse,
  InsertIncomeRequest,
  InsertIncomeResponse,
  TotalIncomesByMonthRequest,
  TotalIncomesByMonthResponse,
  UpdateAffiliateTypeResponse,
  UpdateIncomesBoxRequest
} from "./models"

export const useIncomes = () => {
  const { accessToken } = useUserStore()

  const insertIncome = async (file: File, req: InsertIncomeRequest) => {
    const formData = new FormData()
    formData.append("file", file)

    Object.entries(req).forEach(([key, value]) => {
      if (typeof value !== "undefined" && value !== null)
        formData.append(key, value as string)
    })

    return callApi<FormData, InsertIncomeResponse>({
      path: `/incomes`,
      data: formData,
      method: "POST",
      token: accessToken
    })
  }

  const deleteIncomeByDate = async (req: DeleteIncomeByDateRequest) => {
    const query = toQueryString(req)

    return callApi<never, never>({
      path: `/incomes?${query}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const updateAffiliateType = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return callApi<FormData, UpdateAffiliateTypeResponse>({
      path: `/incomes/update-affiliate`,
      data: formData,
      method: "POST",
      token: accessToken
    })
  }

  const getIncomesByDate = async (req: GetIncomesByDateRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetIncomesByDateResponse[]>({
      path: `/incomes?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const updateIncomesBox = async (req: UpdateIncomesBoxRequest) => {
    const query = toQueryString(req)

    return callApi<UpdateIncomesBoxRequest, never>({
      path: `incomes/update-box?${query}`,
      method: "PATCH",
      token: accessToken
    })
  }

  const totalIncomesByMonth = async (req: TotalIncomesByMonthRequest) => {
    const query = toQueryString(req)

    return callApi<never, TotalIncomesByMonthResponse>({
      path: `/incomes/total-income-by-month?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  return { insertIncome, deleteIncomeByDate }
}
