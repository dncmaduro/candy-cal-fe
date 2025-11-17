import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateSalesCustomerRankRequest,
  CreateSalesCustomerRankResponse,
  GetSalesCustomerRankRequest,
  GetSalesCustomerRankResponse,
  GetSalesCustomerRanksRequest,
  GetSalesCustomerRanksResponse,
  UpdateSalesCustomerRankRequest,
  UpdateSalesCustomerRankResponse
} from "./models"

export const useSalesCustomerRanks = () => {
  const { accessToken } = useUserStore()

  const createSalesCustomerRank = async (
    req: CreateSalesCustomerRankRequest
  ) => {
    return callApi<
      CreateSalesCustomerRankRequest,
      CreateSalesCustomerRankResponse
    >({
      path: `/v1/salescustomerranks`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateSalesCustomerRank = async (
    id: string,
    req: UpdateSalesCustomerRankRequest
  ) => {
    return callApi<
      UpdateSalesCustomerRankRequest,
      UpdateSalesCustomerRankResponse
    >({
      path: `/v1/salescustomerranks/${id}`,
      method: "PUT",
      data: req,
      token: accessToken
    })
  }

  const deleteSalesCustomerRank = async (id: string) => {
    return callApi<never, never>({
      path: `/v1/salescustomerranks/${id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const getSalesCustomerRank = async (req: GetSalesCustomerRankRequest) => {
    return callApi<never, GetSalesCustomerRankResponse>({
      path: `/v1/salescustomerranks/${req.id}`,
      method: "GET",
      token: accessToken
    })
  }

  const getSalesCustomerRanks = async (req: GetSalesCustomerRanksRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetSalesCustomerRanksResponse[]>({
      path: `/v1/salescustomerranks?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    createSalesCustomerRank,
    updateSalesCustomerRank,
    deleteSalesCustomerRank,
    getSalesCustomerRank,
    getSalesCustomerRanks
  }
}
