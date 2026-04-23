import {
  DELIVERED_REQUEST_CHANNEL_PLATFORM,
  type DeliveredRequestChannelPlatform
} from "../../hooks/useDeliveredRequestChannels"

export const getDeliveredRequestChannelLabel = (
  platform: DeliveredRequestChannelPlatform
) =>
  platform === DELIVERED_REQUEST_CHANNEL_PLATFORM.SHOPEE
    ? "Kênh Shopee"
    : "Kênh TikTok Shop"
