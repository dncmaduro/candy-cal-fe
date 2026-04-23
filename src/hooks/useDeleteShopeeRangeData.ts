import { eachDayOfInterval, format, parseISO } from "date-fns"
import { isAxiosError } from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useShopeeDailyMetrics } from "./useShopeeDailyMetrics"
import { useShopeeIncomes } from "./useShopeeIncomes"

export interface DeleteShopeeRangeDataSelection {
  incomes: boolean
  ads: boolean
  liveRevenue: boolean
}

export interface DeleteShopeeRangeDataPayload {
  channelId: string
  orderFrom: string
  orderTo: string
  selection: DeleteShopeeRangeDataSelection
}

export interface DeleteShopeeRangeDataSummary {
  incomesDeletedCount: number
  adsDeletedDays: number
  liveRevenueDeletedDays: number
  noDataDays: number
  failedRequests: number
  errorMessages: string[]
}

const getDeleteErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data &&
    "message" in error.response.data
  ) {
    const message = error.response.data.message

    if (typeof message === "string" && message.trim()) return message
    if (Array.isArray(message)) return message.join(", ")
  }

  if (error instanceof Error && error.message) return error.message
  return "Vui lòng thử lại sau"
}

export const buildShopeeDeleteDateRange = (orderFrom: string, orderTo: string) =>
  eachDayOfInterval({
    start: parseISO(orderFrom),
    end: parseISO(orderTo)
  }).map((date) => format(date, "yyyy-MM-dd"))

export const useDeleteShopeeRangeData = () => {
  const queryClient = useQueryClient()
  const { deleteShopeeIncomes } = useShopeeIncomes()
  const { deleteShopeeDailyAds, deleteShopeeDailyLiveRevenue } =
    useShopeeDailyMetrics()

  return useMutation({
    mutationFn: async ({
      channelId,
      orderFrom,
      orderTo,
      selection
    }: DeleteShopeeRangeDataPayload) => {
      if (!channelId) throw new Error("Vui lòng chọn kênh Shopee")
      if (!orderFrom || !orderTo) {
        throw new Error("Vui lòng chọn đầy đủ khoảng ngày")
      }
      if (!selection.incomes && !selection.ads && !selection.liveRevenue) {
        throw new Error("Vui lòng chọn ít nhất 1 loại dữ liệu để xóa")
      }

      const dates = buildShopeeDeleteDateRange(orderFrom, orderTo)
      const noDataDates = new Set<string>()
      const errorMessages: string[] = []
      let failedRequests = 0
      let incomesDeletedCount = 0
      let adsDeletedDays = 0
      let liveRevenueDeletedDays = 0

      if (selection.incomes) {
        try {
          const response = await deleteShopeeIncomes({
            channelId,
            orderStartDate: orderFrom,
            orderEndDate: orderTo
          })

          incomesDeletedCount = response.data.deletedCount ?? 0
        } catch (error) {
          failedRequests += 1
          errorMessages.push(`Doanh thu: ${getDeleteErrorMessage(error)}`)
        }
      }

      const processBatchResults = (
        results: PromiseSettledResult<unknown>[],
        kind: "ads" | "liveRevenue"
      ) => {
        results.forEach((result, index) => {
          const date = dates[index]

          if (result.status === "fulfilled") {
            if (kind === "ads") {
              adsDeletedDays += 1
            } else {
              liveRevenueDeletedDays += 1
            }
            return
          }

          const error = result.reason

          if (isAxiosError(error) && error.response?.status === 404) {
            noDataDates.add(date)
            return
          }

          failedRequests += 1
          errorMessages.push(
            `${
              kind === "ads" ? "Ads" : "Live doanh thu"
            } ngày ${date}: ${getDeleteErrorMessage(error)}`
          )
        })
      }

      if (selection.ads) {
        const results = await Promise.allSettled(
          dates.map((date) =>
            deleteShopeeDailyAds({
              channel: channelId,
              date
            })
          )
        )

        processBatchResults(results, "ads")
      }

      if (selection.liveRevenue) {
        const results = await Promise.allSettled(
          dates.map((date) =>
            deleteShopeeDailyLiveRevenue({
              channel: channelId,
              date
            })
          )
        )

        processBatchResults(results, "liveRevenue")
      }

      const summary: DeleteShopeeRangeDataSummary = {
        incomesDeletedCount,
        adsDeletedDays,
        liveRevenueDeletedDays,
        noDataDays: noDataDates.size,
        failedRequests,
        errorMessages
      }

      const hasMeaningfulResult =
        incomesDeletedCount > 0 ||
        adsDeletedDays > 0 ||
        liveRevenueDeletedDays > 0 ||
        noDataDates.size > 0

      if (!hasMeaningfulResult && failedRequests > 0) {
        throw new Error(errorMessages[0] || "Không thể xóa dữ liệu Shopee")
      }

      return summary
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["shopee", "rangeMetrics"]
        }),
        queryClient.invalidateQueries({
          queryKey: ["shopee", "orders"]
        }),
        queryClient.invalidateQueries({
          queryKey: ["shopee", "monthlyMetrics"]
        }),
        queryClient.invalidateQueries({
          queryKey: ["searchShopeeIncome"]
        })
      ])
    }
  })
}
