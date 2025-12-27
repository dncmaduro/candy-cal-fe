import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateLivestreamEmployeeRequest,
  DeleteLivestreamEmployeeRequest,
  GetDetailLivestreamEmployeeRequest,
  SearchLivestreamEmployeesRequest,
  SearchLivestreamEmployeesResponse,
  UpdateLivestreamEmployeeRequest
} from "./models"

/**
 * Hook for livestream employees operations (deprecated)
 * Endpoints: /v1/livestreams/employees/*
 * @deprecated This hook is deprecated and should be migrated to newer endpoints
 */
export const useLivestreamEmployees = () => {
  const { accessToken } = useUserStore()

  /** @deprecated */
  const createLivestreamEmployee = async (
    req: CreateLivestreamEmployeeRequest
  ) => {
    return callApi<CreateLivestreamEmployeeRequest, never>({
      method: "POST",
      path: `/v1/livestreams/employees`,
      data: req,
      token: accessToken
    })
  }

  /** @deprecated */
  const updateLivestreamEmployee = async (
    id: string,
    req: UpdateLivestreamEmployeeRequest
  ) => {
    return callApi<UpdateLivestreamEmployeeRequest, never>({
      method: "PUT",
      path: `/v1/livestreams/employees/${id}`,
      data: req,
      token: accessToken
    })
  }

  /** @deprecated */
  const searchLivestreamEmployees = async (
    req: SearchLivestreamEmployeesRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, SearchLivestreamEmployeesResponse>({
      method: "GET",
      path: `/v1/livestreams/employees?${query}`,
      token: accessToken
    })
  }

  /** @deprecated */
  const getLivestreamEmployee = async (
    req: GetDetailLivestreamEmployeeRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetDetailLivestreamEmployeeRequest>({
      method: "GET",
      path: `/v1/livestreams/employees/employee?${query}`,
      token: accessToken
    })
  }

  /** @deprecated */
  const deleteLivestreamEmployee = async (
    req: DeleteLivestreamEmployeeRequest
  ) => {
    return callApi<never, never>({
      method: "DELETE",
      path: `/v1/livestreams/employees/${req.id}`,
      token: accessToken
    })
  }

  return {
    createLivestreamEmployee,
    updateLivestreamEmployee,
    searchLivestreamEmployees,
    getLivestreamEmployee,
    deleteLivestreamEmployee
  }
}
