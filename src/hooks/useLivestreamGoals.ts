import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CreateLivestreamMonthGoalRequest,
  DeleteLivestreamMonthGoalRequest,
  GetLivestreamMonthGoalsRequest,
  GetLivestreamMonthGoalsResponse,
  UpdateLivestreamMonthGoalRequest
} from "./models"

/**
 * Hook for livestream month goals operations
 * Endpoints: /v1/livestreammonthgoals/*
 */
export const useLivestreamGoals = () => {
  const { accessToken } = useUserStore()

  const createLivestreamMonthGoal = async (
    req: CreateLivestreamMonthGoalRequest
  ) => {
    return callApi<CreateLivestreamMonthGoalRequest, never>({
      method: "POST",
      path: `/v1/livestreammonthgoals`,
      data: req,
      token: accessToken
    })
  }

  const getLivestreamMonthGoals = async (
    req: GetLivestreamMonthGoalsRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetLivestreamMonthGoalsResponse>({
      method: "GET",
      path: `/v1/livestreammonthgoals?${query}`,
      token: accessToken
    })
  }

  const updateLivestreamMonthGoal = async (
    id: string,
    req: UpdateLivestreamMonthGoalRequest
  ) => {
    return callApi<UpdateLivestreamMonthGoalRequest, never>({
      method: "PUT",
      path: `/v1/livestreammonthgoals/${id}`,
      data: req,
      token: accessToken
    })
  }

  const deleteLivestreamMonthGoal = async (
    req: DeleteLivestreamMonthGoalRequest
  ) => {
    return callApi<never, never>({
      method: "DELETE",
      path: `/v1/livestreammonthgoals/${req.id}`,
      token: accessToken
    })
  }

  return {
    createLivestreamMonthGoal,
    getLivestreamMonthGoals,
    updateLivestreamMonthGoal,
    deleteLivestreamMonthGoal
  }
}
