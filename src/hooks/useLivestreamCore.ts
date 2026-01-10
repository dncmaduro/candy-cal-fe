import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  AddLivestreamSnapshotRequest,
  CreateLivestreamRangeRequest,
  FixLivestreamRequest,
  FixLivestreamResponse,
  GetLivestreamByDateRangeRequest,
  GetLivestreamByDateRangeResponse,
  ReportLivestreamRequest,
  ReportLivestreamResponse,
  SetMetricsRequest,
  SyncSnapshotRequest,
  SyncSnapshotResponse,
  UpdateLivestreamSnapshotRequest,
  UpdateSnapshotAltRequest,
  UpdateSnapshotAltResponse
} from "./models"

/**
 * Hook for livestream core operations (ranges, snapshots, metrics)
 * Endpoints: /v1/livestreamcore/*
 */
export const useLivestreamCore = () => {
  const { accessToken } = useUserStore()

  const createLivestreamRange = async (req: CreateLivestreamRangeRequest) => {
    return callApi<CreateLivestreamRangeRequest, never>({
      method: "POST",
      path: `/v1/livestreamcore/range`,
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
      path: `/v1/livestreamcore/${id}/snapshots`,
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
      path: `/v1/livestreamcore/${id}/snapshots/${snapshotId}`,
      data: req,
      token: accessToken
    })
  }

  const setMetrics = async (id: string, req: SetMetricsRequest) => {
    return callApi<SetMetricsRequest, never>({
      method: "POST",
      path: `/v1/livestreamcore/${id}/metrics`,
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
      path: `/v1/livestreamcore/by-date-range?${query}`,
      token: accessToken
    })
  }

  const syncSnapshot = async (req: SyncSnapshotRequest) => {
    return callApi<SyncSnapshotRequest, SyncSnapshotResponse>({
      method: "POST",
      path: `/v1/livestreamcore/sync-snapshots`,
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
      path: `/v1/livestreamcore/${livestreamId}/snapshots/${snapshotId}/report`,
      data: req,
      token: accessToken
    })
  }

  const updateSnapshotAltRequest = async (
    livestreamId: string,
    snapshotId: string,
    req: UpdateSnapshotAltRequest
  ) => {
    return callApi<UpdateSnapshotAltRequest, UpdateSnapshotAltResponse>({
      method: "PATCH",
      path: `/v1/livestreamcore/${livestreamId}/snapshots/${snapshotId}/alt`,
      data: req,
      token: accessToken
    })
  }

  const fixLivestream = async (req: FixLivestreamRequest) => {
    return callApi<FixLivestreamRequest, FixLivestreamResponse>({
      method: "PATCH",
      path: `/v1/livestreamcore/fix-by-date`,
      data: req,
      token: accessToken
    })
  }

  return {
    createLivestreamRange,
    addLivestreamSnapshot,
    updateLivestreamSnapshot,
    setMetrics,
    getLivestreamsByDateRange,
    syncSnapshot,
    reportLivestream,
    updateSnapshotAltRequest,
    fixLivestream
  }
}
