import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useUserStore } from "../store/userStore"
import type {
  ShopeeDashboardOverviewRequest,
  ShopeeDashboardRevenueAdjustment
} from "./models"
import {
  fetchShopeeDashboardOverview,
  mapOverviewWithAdjustment,
  normalizeShopeeDashboardOverviewRequest
} from "./shopeeDashboardApi"

type UseShopeeDashboardOverviewArgs = Partial<ShopeeDashboardOverviewRequest> & {
  adjustment?: Partial<ShopeeDashboardRevenueAdjustment>
  enabled?: boolean
}

export const useShopeeDashboardOverview = ({
  adjustment,
  enabled = true,
  ...request
}: UseShopeeDashboardOverviewArgs = {}) => {
  const { accessToken } = useUserStore()
  const normalizedRequest = normalizeShopeeDashboardOverviewRequest(request)

  const query = useQuery({
    queryKey: [
      "shopeeDashboardOverview",
      normalizedRequest.month,
      normalizedRequest.year,
      normalizedRequest.channelId
    ],
    queryFn: () =>
      fetchShopeeDashboardOverview({
        accessToken,
        request: normalizedRequest
      }),
    select: (response) => response.data,
    enabled: enabled && Boolean(accessToken),
    placeholderData: (previousData) => previousData
  })

  const data = useMemo(() => {
    if (!query.data) return undefined

    return mapOverviewWithAdjustment(query.data, adjustment)
  }, [adjustment, query.data])

  return {
    ...query,
    data
  }
}
