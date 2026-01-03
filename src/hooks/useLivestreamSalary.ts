import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import {
  CreateLivestreamSalaryRequest,
  CreateLivestreamSalaryResponse,
  DeleteLivestreamSalaryRequest,
  GetLivestreamSalaryDetailRequest,
  GetLivestreamSalaryDetailResponse,
  SearchLivestreamSalaryRequest,
  SearchLivestreamSalaryResponse,
  UpdateLivestreamSalaryRequest,
  UpdateLivestreamSalaryResponse
} from "./models"
import { toQueryString } from "../utils/toQuery"

export const useLivestreamSalary = () => {
  const { accessToken } = useUserStore()

  const createLivestreamSalary = (req: CreateLivestreamSalaryRequest) => {
    return callApi<
      CreateLivestreamSalaryRequest,
      CreateLivestreamSalaryResponse
    >({
      method: "POST",
      path: `/v1/livestreamsalary`,
      data: req,
      token: accessToken
    })
  }

  const updateLivestreamSalary = (
    id: string,
    req: UpdateLivestreamSalaryRequest
  ) => {
    return callApi<
      UpdateLivestreamSalaryRequest,
      UpdateLivestreamSalaryResponse
    >({
      method: "PUT",
      path: `/v1/livestreamsalary/${id}`,
      data: req,
      token: accessToken
    })
  }

  const searchLivestreamSalary = (req: SearchLivestreamSalaryRequest) => {
    const query = toQueryString(req)

    return callApi<never, SearchLivestreamSalaryResponse>({
      method: "GET",
      path: `/v1/livestreamsalary/search?${query}`,
      token: accessToken
    })
  }

  const getLivestreamSalaryDetail = (req: GetLivestreamSalaryDetailRequest) => {
    return callApi<never, GetLivestreamSalaryDetailResponse>({
      method: "GET",
      path: `/v1/livestreamsalary/${req.id}`,
      token: accessToken
    })
  }

  const deleteLivestreamSalary = (req: DeleteLivestreamSalaryRequest) => {
    return callApi<never, never>({
      method: "DELETE",
      path: `/v1/livestreamsalary/${req.id}`,
      token: accessToken
    })
  }

  return {
    createLivestreamSalary,
    updateLivestreamSalary,
    searchLivestreamSalary,
    getLivestreamSalaryDetail,
    deleteLivestreamSalary
  }
}
