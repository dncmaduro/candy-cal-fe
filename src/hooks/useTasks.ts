import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateTaskDefinitionRequest,
  CreateTaskDefinitionResponse,
  GenerateTasksRequest,
  GenerateTasksResponse,
  GetAllTasksDefinitionsResponse,
  GetAllUsersTasksRequest,
  GetAllUsersTasksResponse,
  GetOwnTasksResponse,
  GetUserTasksRequest,
  GetUserTasksResponse,
  MarkTaskAsDoneRequest,
  MarkTaskAsDoneResponse,
  UpdateTaskDefinitionRequest,
  UpdateTaskDefinitionResponse
} from "./models"

export const useTasks = () => {
  const { accessToken } = useUserStore()

  const getOwnTasks = async () => {
    return callApi<never, GetOwnTasksResponse>({
      path: `/v1/dailytasks/me`,
      method: "GET",
      token: accessToken
    })
  }

  const markTaskAsDone = async (req: MarkTaskAsDoneRequest) => {
    return callApi<MarkTaskAsDoneRequest, MarkTaskAsDoneResponse>({
      path: `/v1/dailytasks/${req.code}/done`,
      method: "PATCH",
      token: accessToken
    })
  }

  const getAllTasksDefinitions = async (params?: {
    page?: number
    limit?: number
  }) => {
    const search = new URLSearchParams()
    if (params?.page) search.set("page", String(params.page))
    if (params?.limit) search.set("limit", String(params.limit))
    const qs = search.toString()
    return callApi<never, GetAllTasksDefinitionsResponse>({
      path: `/v1/dailytasks/definitions${qs ? `?${qs}` : ""}`,
      method: "GET",
      token: accessToken
    })
  }

  const createTaskDefinition = async (req: CreateTaskDefinitionRequest) => {
    return callApi<CreateTaskDefinitionRequest, CreateTaskDefinitionResponse>({
      path: `/v1/dailytasks/definitions`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateTaskDefinition = async (
    code: string,
    req: UpdateTaskDefinitionRequest
  ) => {
    return callApi<UpdateTaskDefinitionRequest, UpdateTaskDefinitionResponse>({
      path: `/v1/dailytasks/definitions/${code}`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  const deleteTaskDefinition = async (code: string) => {
    return callApi<never, never>({
      path: `/v1/dailytasks/definitions/${code}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const generateTasks = async (req: GenerateTasksRequest) => {
    const query = toQueryString(req)

    return callApi<never, GenerateTasksResponse>({
      path: `/v1/dailytasks/generate?${query}`,
      method: "POST",
      token: accessToken
    })
  }

  const getAllUsersTasks = async (req: GetAllUsersTasksRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetAllUsersTasksResponse>({
      path: `/v1/dailytasks/users?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getUserTasks = async (userId: string, req: GetUserTasksRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetUserTasksResponse>({
      path: `/v1/dailytasks/users/${userId}?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  return {
    getOwnTasks,
    markTaskAsDone,
    getAllTasksDefinitions,
    createTaskDefinition,
    updateTaskDefinition,
    deleteTaskDefinition,
    generateTasks,
    getAllUsersTasks,
    getUserTasks
  }
}
