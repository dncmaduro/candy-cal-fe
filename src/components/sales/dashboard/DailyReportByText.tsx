import { useQuery } from "@tanstack/react-query"
import { CreateSalesDailyReportResponse } from "../../../hooks/models"
import { useSalesChannels } from "../../../hooks/useSalesChannels"
import { format } from "date-fns"
import { useSalesDailyReports } from "../../../hooks/useSalesDailyReports"
import { Box, Button, Paper, Stack, Text } from "@mantine/core"
import { IconCopy, IconCheck } from "@tabler/icons-react"
import { useState } from "react"
import { CToast } from "../../common/CToast"

interface DailyReportByTextProps {
  report: CreateSalesDailyReportResponse
}

interface CopyableBlockProps {
  text: string
}

const CopyableBlock = ({ text }: CopyableBlockProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      CToast.success({ title: "Đã sao chép nội dung" })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      CToast.error({ title: "Không thể sao chép" })
    }
  }

  const buttonLabel = copied ? "Đã sao chép!" : "Sao chép toàn bộ"

  return (
    <Stack gap="sm">
      <Paper
        withBorder
        radius="md"
        p="md"
        bg="gray.0"
        role="region"
        aria-label="Nội dung báo cáo doanh số"
      >
        <Text
          fz="sm"
          lh={1.6}
          style={{
            whiteSpace: "pre-wrap", // giữ xuống dòng nhưng vẫn là chữ bình thường
            margin: 0
          }}
        >
          {text}
        </Text>
      </Paper>

      <Button
        fullWidth
        leftSection={
          copied ? (
            <IconCheck size={18} aria-hidden="true" />
          ) : (
            <IconCopy size={18} aria-hidden="true" />
          )
        }
        onClick={handleCopy}
        color={copied ? "teal" : "blue"}
        variant={copied ? "light" : "filled"}
        size="sm"
        aria-label={buttonLabel}
      >
        {buttonLabel}
      </Button>
    </Stack>
  )
}

export const DailyReportByText = ({ report }: DailyReportByTextProps) => {
  const { getSalesChannelDetail } = useSalesChannels()
  const { getSalesMonthKpi } = useSalesDailyReports()

  const { data: channelData } = useQuery({
    queryKey: ["salesChannelDetail", report.channel],
    queryFn: () => getSalesChannelDetail(report.channel),
    select: (data) => data.data
  })

  const { data: kpiData } = useQuery({
    queryKey: ["getSalesMonthKpi", report.date, report.channel],
    queryFn: () =>
      getSalesMonthKpi({
        date: new Date(report.date),
        channelId: report.channel
      }),
    select: (data) => data.data.kpi ?? 1
  })

  const dateLabel = format(report.date, "dd/MM/yyyy")
  const monthLabel = "11" // giữ nguyên logic text cũ

  const text = `Báo cáo doanh số sỉ lẻ kênh ${channelData?.channelName} ngày ${dateLabel}
  
1. Doanh số ngày ${dateLabel}: ${report.revenue.toLocaleString("vi-VN")}đ / KPI ngày ${report.dateKpi.toLocaleString("vi-VN")}đ (${((report.revenue / report.dateKpi) * 100).toFixed(2)}%)
   • Doanh số khách mới: ${(report.newFunnelRevenue.ads + report.newFunnelRevenue.other).toLocaleString("vi-VN")}đ (${report.newOrder} đơn)
   • Doanh số khách cũ: ${report.returningFunnelRevenue.toLocaleString("vi-VN")}đ (${report.returningOrder} đơn)

2. Lũy kế doanh số tháng ${monthLabel}: ${(report.accumulatedRevenue + report.revenue).toLocaleString("vi-VN")}đ / KPI: ${kpiData?.toLocaleString("vi-VN")}đ (${(((report.accumulatedRevenue + report.revenue) / (kpiData ?? 1)) * 100).toFixed(2)}%)

3. Lũy kế chi phí ads tháng ${monthLabel}: ${(report.accumulatedAdsCost + report.adsCost).toLocaleString("vi-VN")}đ / DT Khách mới: ${(report.accumulatedNewFunnelRevenue.ads + report.newFunnelRevenue.ads).toLocaleString("vi-VN")}đ
   • CAC: ${(((report.accumulatedAdsCost + report.adsCost) / (report.accumulatedNewFunnelRevenue.ads + report.newFunnelRevenue.ads)) * 100).toFixed(2)}%
`

  return (
    <Stack gap="md">
      <Box>
        <Text fw={600} fz="sm" mb={4}>
          Tin nhắn báo cáo
        </Text>
        <Text fz="xs" c="dimmed">
          Nội dung bên dưới đã format sẵn để gửi qua Zalo / chat nội bộ. Bạn có
          thể chỉnh lại đôi chút trước khi gửi.
        </Text>
      </Box>

      <CopyableBlock text={text} />
    </Stack>
  )
}
