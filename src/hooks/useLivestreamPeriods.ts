import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import {
  CreateLivestreamPeriodRequest,
  DeleteLivestreamPeriodRequest,
  GetAllLivestreamPeriodsResponse,
  GetDetailLivestreamPeriodRequest,
  GetDetailLivestreamPeriodResponse,
  UpdateLivestreamPeriodRequest
} from "./models"

/**
 * Hook for livestream periods operations
 * Endpoints: /v1/livestreamperiods/*
 */
export const useLivestreamPeriods = () => {
  const { accessToken } = useUserStore()

  const createLivestreamPeriod = async (req: CreateLivestreamPeriodRequest) => {
    return callApi<CreateLivestreamPeriodRequest, never>({
      method: "POST",
      path: `/v1/livestreamperiods`,
      data: req,
      token: accessToken
    })
  }

  const updateLivestreamPeriod = async (
    id: string,
    req: UpdateLivestreamPeriodRequest
  ) => {
    return callApi<UpdateLivestreamPeriodRequest, never>({
      method: "PUT",
      path: `/v1/livestreamperiods/${id}`,
      data: req,
      token: accessToken
    })
  }

  const getAllLivestreamPeriods = async () => {
    return callApi<never, GetAllLivestreamPeriodsResponse>({
      method: "GET",
      path: `/v1/livestreamperiods`,
      token: accessToken
    })
  }

  const getDetailLivestreamPeriod = async (
    req: GetDetailLivestreamPeriodRequest
  ) => {
    return callApi<never, GetDetailLivestreamPeriodResponse>({
      method: "GET",
      path: `/v1/livestreamperiods/${req.id}`,
      token: accessToken
    })
  }

  const deleteLivestreamPeriod = async (req: DeleteLivestreamPeriodRequest) => {
    return callApi<never, never>({
      method: "DELETE",
      path: `/v1/livestreamperiods/${req.id}`,
      token: accessToken
    })
  }

  return {
    createLivestreamPeriod,
    updateLivestreamPeriod,
    getAllLivestreamPeriods,
    getDetailLivestreamPeriod,
    deleteLivestreamPeriod
  }
}
