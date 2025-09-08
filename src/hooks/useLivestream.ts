import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  AddLivestreamSnapshotRequest,
  CreateLivestreamEmployeeRequest,
  CreateLivestreamPeriodRequest,
  CreateLivestreamRangeRequest,
  DeleteLivestreamEmployeeRequest,
  DeleteLivestreamPeriodRequest,
  GetAllLivestreamPeriodsResponse,
  GetDetailLivestreamEmployeeRequest,
  GetDetailLivestreamPeriodRequest,
  GetDetailLivestreamPeriodResponse,
  GetLivestreamByDateRangeRequest,
  GetLivestreamByDateRangeResponse,
  GetMonthlyTotalsLivestreamRequest,
  GetMonthlyTotalsLivestreamResponse,
  SearchLivestreamEmployeesRequest,
  SearchLivestreamEmployeesResponse,
  SetMetricsRequest,
  UpdateLivestreamEmployeeRequest,
  UpdateLivestreamPeriodRequest,
  UpdateLivestreamSnapshotRequest
} from "./models"

export const useLivestream = () => {
  const { accessToken } = useUserStore()

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

  const deleteLivestreamEmployee = async (
    req: DeleteLivestreamEmployeeRequest
  ) => {
    return callApi<never, never>({
      method: "DELETE",
      path: `/v1/livestreams/employees/${req.id}`,
      token: accessToken
    })
  }

  const createLivestreamPeriod = async (req: CreateLivestreamPeriodRequest) => {
    return callApi<CreateLivestreamPeriodRequest, never>({
      method: "POST",
      path: `/v1/livestreams/periods`,
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
      path: `/v1/livestreams/periods/${id}`,
      data: req,
      token: accessToken
    })
  }

  const getAllLivestreamPeriods = async () => {
    return callApi<never, GetAllLivestreamPeriodsResponse>({
      method: "GET",
      path: `/v1/livestreams/periods`,
      token: accessToken
    })
  }

  const getDetailLivestreamPeriod = async (
    req: GetDetailLivestreamPeriodRequest
  ) => {
    return callApi<never, GetDetailLivestreamPeriodResponse>({
      method: "GET",
      path: `/v1/livestreams/periods/${req.id}`,
      token: accessToken
    })
  }

  const deleteLivestreamPeriod = async (req: DeleteLivestreamPeriodRequest) => {
    return callApi<never, never>({
      method: "DELETE",
      path: `/v1/livestreams/periods/${req.id}`,
      token: accessToken
    })
  }

  const createLivestreamRange = async (req: CreateLivestreamRangeRequest) => {
    return callApi<CreateLivestreamRangeRequest, never>({
      method: "POST",
      path: `/v1/livestreams/range`,
      data: req,
      token: accessToken
    })
  }

  const addLivestreamSnapshot = async (
    id: string,
    req: AddLivestreamSnapshotRequest
  ) => {
    return callApi<AddLivestreamSnapshotRequest, never>({
      method: "POST",
      path: `/v1/livestreams/${id}/snapshots`,
      data: req,
      token: accessToken
    })
  }

  const updateLivestreamSnapshot = async (
    id: string,
    snapshotId: string,
    req: UpdateLivestreamSnapshotRequest
  ) => {
    return callApi<UpdateLivestreamSnapshotRequest, never>({
      method: "PUT",
      path: `/v1/livestreams/${id}/snapshots/${snapshotId}`,
      data: req,
      token: accessToken
    })
  }

  const setMetrics = async (id: string, req: SetMetricsRequest) => {
    return callApi<SetMetricsRequest, never>({
      method: "POST",
      path: `/v1/livestreams/${id}/metrics`,
      data: req,
      token: accessToken
    })
  }

  const getLivestreamsByDateRange = async (
    req: GetLivestreamByDateRangeRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, GetLivestreamByDateRangeResponse>({
      method: "GET",
      path: `/v1/livestreams?${query}`,
      token: accessToken
    })
  }

  const getMonthlyTotalsLivestreams = async (
    req: GetMonthlyTotalsLivestreamRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, Record<string, GetMonthlyTotalsLivestreamResponse>>({
      method: "GET",
      path: `/v1/livestreams/monthly-totals?${query}`,
      token: accessToken
    })
  }

  return {
    createLivestreamEmployee,
    updateLivestreamEmployee,
    searchLivestreamEmployees,
    getLivestreamEmployee,
    deleteLivestreamEmployee,
    createLivestreamPeriod,
    updateLivestreamPeriod,
    getAllLivestreamPeriods,
    getDetailLivestreamPeriod,
    deleteLivestreamPeriod,
    createLivestreamRange,
    addLivestreamSnapshot,
    updateLivestreamSnapshot,
    setMetrics,
    getLivestreamsByDateRange,
    getMonthlyTotalsLivestreams
  }
}
