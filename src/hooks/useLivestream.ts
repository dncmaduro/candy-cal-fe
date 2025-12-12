import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  AddLivestreamSnapshotRequest,
  CreateLivestreamChannelRequest,
  CreateLivestreamEmployeeRequest,
  CreateLivestreamMonthGoalRequest,
  CreateLivestreamPeriodRequest,
  CreateLivestreamRangeRequest,
  DeleteLivestreamChannelRequest,
  DeleteLivestreamEmployeeRequest,
  DeleteLivestreamMonthGoalRequest,
  DeleteLivestreamPeriodRequest,
  GetAggregatedMetricsRequest,
  GetAggregatedMetricsResponse,
  GetAllLivestreamPeriodsResponse,
  GetDetailLivestreamEmployeeRequest,
  GetDetailLivestreamPeriodRequest,
  GetDetailLivestreamPeriodResponse,
  GetLivestreamByDateRangeRequest,
  GetLivestreamByDateRangeResponse,
  GetLivestreamChannelDetailResponse,
  GetLivestreamMonthGoalsRequest,
  GetLivestreamMonthGoalsResponse,
  GetLivestreamStatsRequest,
  GetLivestreamStatsResponse,
  GetMonthlyTotalsLivestreamRequest,
  GetMonthlyTotalsLivestreamResponse,
  ReportLivestreamRequest,
  ReportLivestreamResponse,
  SearchLivestreamChannelsRequest,
  SearchLivestreamChannelsResponse,
  SearchLivestreamEmployeesRequest,
  SearchLivestreamEmployeesResponse,
  SetMetricsRequest,
  SyncSnapshotRequest,
  SyncSnapshotResponse,
  UpdateLivestreamChannelRequest,
  UpdateLivestreamEmployeeRequest,
  UpdateLivestreamMonthGoalRequest,
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

  const getLivestreamStats = async (req: GetLivestreamStatsRequest) => {
    const query = toQueryString(req)

    return callApi<never, GetLivestreamStatsResponse>({
      method: "GET",
      path: `/v1/livestreams/stats?${query}`,
      token: accessToken
    })
  }

  const createLivestreamMonthGoal = async (
    req: CreateLivestreamMonthGoalRequest
  ) => {
    return callApi<CreateLivestreamMonthGoalRequest, never>({
      method: "POST",
      path: `/v1/livestreams/goals`,
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
      path: `/v1/livestreams/goals?${query}`,
      token: accessToken
    })
  }

  const updateLivestreamMonthGoal = async (
    id: string,
    req: UpdateLivestreamMonthGoalRequest
  ) => {
    return callApi<UpdateLivestreamMonthGoalRequest, never>({
      method: "PUT",
      path: `/v1/livestreams/goals/${id}`,
      data: req,
      token: accessToken
    })
  }

  const deleteLivestreamMonthGoal = async (
    req: DeleteLivestreamMonthGoalRequest
  ) => {
    return callApi<never, never>({
      method: "DELETE",
      path: `/v1/livestreams/goals/${req.id}`,
      token: accessToken
    })
  }

  const createLivestreamChannel = async (
    req: CreateLivestreamChannelRequest
  ) => {
    return callApi<CreateLivestreamChannelRequest, never>({
      method: "POST",
      path: `/v1/livestreams/channels`,
      data: req,
      token: accessToken
    })
  }

  const searchLivestreamChannels = async (
    req: SearchLivestreamChannelsRequest
  ) => {
    const query = toQueryString(req)

    return callApi<never, SearchLivestreamChannelsResponse>({
      method: "GET",
      path: `/v1/livestreams/channels?${query}`,
      token: accessToken
    })
  }

  const getLivestreamChannelDetail = async (id: string) => {
    return callApi<never, GetLivestreamChannelDetailResponse>({
      method: "GET",
      path: `/v1/livestreams/channels/${id}`,
      token: accessToken
    })
  }

  const updateLivestreamChannel = async (
    id: string,
    req: UpdateLivestreamChannelRequest
  ) => {
    return callApi<UpdateLivestreamChannelRequest, never>({
      method: "PUT",
      path: `/v1/livestreams/channels/${id}`,
      data: req,
      token: accessToken
    })
  }

  const deleteLivestreamChannel = async (
    req: DeleteLivestreamChannelRequest
  ) => {
    return callApi<never, never>({
      method: "DELETE",
      path: `/v1/livestreams/channels/${req.id}`,
      token: accessToken
    })
  }

  const syncSnapshot = async (req: SyncSnapshotRequest) => {
    return callApi<SyncSnapshotRequest, SyncSnapshotResponse>({
      method: "POST",
      path: `/v1/livestreams/sync-snapshots`,
      data: req,
      token: accessToken
    })
  }

  const reportLivestream = async (
    livestreamId: string,
    snapshotId: string,
    req: ReportLivestreamRequest
  ) => {
    return callApi<ReportLivestreamRequest, ReportLivestreamResponse>({
      method: "PATCH",
      path: `/v1/livestreams/${livestreamId}/snapshots/${snapshotId}/report`,
      data: req,
      token: accessToken
    })
  }

  const getAggregatedMetrics = async (req: GetAggregatedMetricsRequest) => {
    const query = toQueryString(req)

    return callApi<GetAggregatedMetricsRequest, GetAggregatedMetricsResponse>({
      method: "GET",
      path: `/v1/livestreams/aggregated-metrics?${query}`,
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
    getMonthlyTotalsLivestreams,
    getLivestreamStats,
    createLivestreamMonthGoal,
    getLivestreamMonthGoals,
    updateLivestreamMonthGoal,
    deleteLivestreamMonthGoal,
    createLivestreamChannel,
    searchLivestreamChannels,
    getLivestreamChannelDetail,
    updateLivestreamChannel,
    deleteLivestreamChannel,
    syncSnapshot,
    reportLivestream,
    getAggregatedMetrics
  }
}
