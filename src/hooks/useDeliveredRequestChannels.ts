import { useQuery } from "@tanstack/react-query"
import type { LivestreamChannel } from "./models"
import { useLivestreamChannels } from "./useLivestreamChannels"

export const DELIVERED_REQUEST_CHANNEL_PLATFORM = {
  SHOPEE: "shopee",
  TIKTOKSHOP: "tiktokshop"
} as const

export type DeliveredRequestChannelPlatform =
  (typeof DELIVERED_REQUEST_CHANNEL_PLATFORM)[keyof typeof DELIVERED_REQUEST_CHANNEL_PLATFORM]

export const useDeliveredRequestChannels = (
  platform: DeliveredRequestChannelPlatform
) => {
  const { searchLivestreamChannels } = useLivestreamChannels()

  return useQuery({
    queryKey: ["deliveredRequestChannels", platform],
    queryFn: async () => {
      const response = await searchLivestreamChannels({ page: 1, limit: 200 })
      return response.data.data ?? []
    },
    select: (channels): LivestreamChannel[] =>
      channels
        .filter((channel) => channel.platform === platform)
        .sort((a, b) => a.name.localeCompare(b.name)),
    refetchOnWindowFocus: false
  })
}
