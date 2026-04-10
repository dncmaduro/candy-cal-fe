import { useQuery } from "@tanstack/react-query"
import { useUserStore } from "../store/userStore"
import type { SearchLivestreamChannelsRequest } from "./models"
import {
  buildShopeeChannelOptions,
  fetchShopeeChannels,
  normalizeShopeeChannelsRequest
} from "./shopeeDashboardApi"

export const useShopeeChannels = (
  request: Partial<SearchLivestreamChannelsRequest> = {}
) => {
  const { accessToken } = useUserStore()
  const normalizedRequest = normalizeShopeeChannelsRequest(request)

  return useQuery({
    queryKey: [
      "shopeeChannels",
      normalizedRequest.searchText,
      normalizedRequest.page,
      normalizedRequest.limit,
      normalizedRequest.platform
    ],
    queryFn: () =>
      fetchShopeeChannels({
        accessToken,
        request: normalizedRequest
      }),
    select: (response) => {
      const channels = response.data.data

      return {
        channels,
        total: response.data.total,
        options: buildShopeeChannelOptions(channels)
      }
    },
    enabled: Boolean(accessToken)
  })
}
