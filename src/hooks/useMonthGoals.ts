import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateMonthGoalRequest,
  CreateMonthGoalResponse,
  DeleteGoalRequest,
  GetGoalRequest,
  GetGoalResponse,
  GetGoalsRequest,
  GetGoalsResponse,
  UpdateGoalRequest,
  UpdateGoalResponse
} from "./models"

export const useMonthGoals = () => {
  const { accessToken } = useUserStore()

  const createMonthGoal = async (req: CreateMonthGoalRequest) => {
    return callApi<CreateMonthGoalRequest, CreateMonthGoalResponse>({
      path: `/v1/monthgoals`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const getGoals = async (req: GetGoalsRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetGoalsResponse>({
      path: `/v1/monthgoals/year?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const getGoal = async (req: GetGoalRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetGoalResponse>({
      path: `/v1/monthgoals/month?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const updateGoal = async (req: UpdateGoalRequest) => {
    return callApi<UpdateGoalRequest, UpdateGoalResponse>({
      path: `/v1/monthgoals`,
      method: "PATCH",
      data: req,
      token: accessToken
    })
  }

  const deleteGoal = async (req: DeleteGoalRequest) => {
    const query = toQueryString(req)

    return callApi<never, never>({
      path: `/v1/monthgoals?${query}`,
      method: "DELETE",
      token: accessToken
    })
  }

  return {
    createMonthGoal,
    getGoals,
    getGoal,
    updateGoal,
    deleteGoal
  }
}
