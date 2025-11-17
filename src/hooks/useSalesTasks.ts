import {
  CreateSalesTaskRequest,
  CreateSalesTaskResponse,
  UpdateSalesTaskRequest,
  UpdateSalesTaskResponse,
  GetSalesTaskResponse,
  GetSalesTasksRequest,
  GetSalesTasksResponse,
  CompleteTaskRequest,
  CompleteTaskResponse
} from "./models"
import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import { toQueryString } from "../utils/toQuery"

export const useSalesTasks = () => {
  const { accessToken } = useUserStore()

  const createSalesTask = async (req: CreateSalesTaskRequest) => {
    return callApi<CreateSalesTaskRequest, CreateSalesTaskResponse>({
      path: `/v1/salestasks`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateSalesTask = async (id: string, req: UpdateSalesTaskRequest) => {
    return callApi<UpdateSalesTaskRequest, UpdateSalesTaskResponse>({
      path: `/v1/salestasks/${id}`,
      method: "PUT",
      data: req,
      token: accessToken
    })
  }

  const deleteSalesTask = async (id: string) => {
    return callApi<never, never>({
      path: `/v1/salestasks/${id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const getSalesTask = async (id: string) => {
    return callApi<never, GetSalesTaskResponse>({
      path: `/v1/salestasks/${id}`,
      method: "GET",
      token: accessToken
    })
  }

  const getSalesTasks = async (req: GetSalesTasksRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetSalesTasksResponse>({
      path: `/v1/salestasks?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const completeTask = async (id: string) => {
    return callApi<CompleteTaskRequest, CompleteTaskResponse>({
      path: `/v1/salestasks/${id}/complete`,
      method: "PATCH",
      token: accessToken
    })
  }

  return {
    createSalesTask,
    updateSalesTask,
    deleteSalesTask,
    getSalesTask,
    getSalesTasks,
    completeTask
  }
}
