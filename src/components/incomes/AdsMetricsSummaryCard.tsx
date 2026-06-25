import { formatCurrency, formatPercent } from "./analytics/formatters"

type AdsSourceMode = "legacy" | "metrics" | "mixed"

type AdsMetricsSummary = {
  totalAdsCost?: number
  actualAdsCost: number
  totalCost: number
  ratios: {
    adsRatioOnBeforeDiscountRevenue: number
    totalCostRatioOnBeforeDiscountRevenue: number
    costAfterRefundRatioOnBeforeDiscountRevenue: number
  }
  rawMetrics: {
    roiProtect: number
    tinRefundAmount: number
    gmvAds: number
    affiliateCost: number
    affiliateRefundAmount: number
    totalRevenue: number
    adjustedRevenue?: number
    refundCancelRate: number
  }
  adsSourceMode?: AdsSourceMode
  metricsDaysCount?: number
}

export function AdsMetricsSummaryCard({
  title = "Chỉ số ads tổng hợp",
  subtitle,
  data
}: {
  title?: string
  subtitle?: string
  data: AdsMetricsSummary
}) {
  const shouldShowHybridTotal =
    typeof data.totalAdsCost === "number" &&
    Math.abs(data.totalAdsCost - data.actualAdsCost) > 0.001

  const inputRows = [
    {
      label: "Khoản bù ROI",
      value: formatCurrency(data.rawMetrics.roiProtect)
    },
    {
      label: "Tiền hoàn tín",
      value: formatCurrency(data.rawMetrics.tinRefundAmount)
    },
    {
      label: "GMV từ ads",
      value: formatCurrency(data.rawMetrics.gmvAds)
    },
    {
      label: "Chi phí cộng tác viên",
      value: formatCurrency(data.rawMetrics.affiliateCost)
    },
    {
      label: "Doanh thu tổng",
      value: formatCurrency(data.rawMetrics.totalRevenue)
    },
    {
      label: "Tỷ lệ hoàn / hủy",
      value: formatPercent(data.rawMetrics.refundCancelRate),
      accent: "text-amber-700"
    }
  ]

  const calculatedRows = [
    ...(shouldShowHybridTotal && typeof data.totalAdsCost === "number"
      ? [
          {
            label: "Tổng chi phí ads đang dùng",
            value: formatCurrency(data.totalAdsCost),
            accent: "text-sky-700"
          }
        ]
      : []),
    {
      label: "Chi phí ads thực tế",
      value: formatCurrency(data.actualAdsCost),
      accent: "text-sky-700"
    },
    {
      label: "Khoản hoàn / hủy affiliate",
      value: formatCurrency(data.rawMetrics.affiliateRefundAmount),
      accent: "text-rose-700"
    },
    {
      label: "Chi phí ads + affiliate",
      value: formatCurrency(data.totalCost),
      accent: "text-violet-700"
    },
    {
      label: "Tỷ lệ ads / doanh thu",
      value: formatPercent(data.ratios.adsRatioOnBeforeDiscountRevenue)
    },
    {
      label: "Tỷ lệ ads + affiliate / doanh thu",
      value: formatPercent(data.ratios.totalCostRatioOnBeforeDiscountRevenue)
    },
    {
      label: "Tỷ lệ sau hoàn / hủy / doanh thu",
      value: formatPercent(
        data.ratios.costAfterRefundRatioOnBeforeDiscountRevenue
      ),
      accent: "text-emerald-700"
    }
  ]

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">
              Tóm tắt chỉ số ads
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
            )}
          </div>
        </div>

        <SummaryTable title="Dữ liệu đầu vào" rows={inputRows} />
        <SummaryTable title="Kết quả tính toán" rows={calculatedRows} />
      </div>
    </section>
  )
}

function SummaryTable({
  title,
  rows
}: {
  title: string
  rows: Array<{ label: string; value: string; accent?: string }>
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-white">
              {rows.map((row) => (
                <th
                  key={row.label}
                  className="min-w-[140px] border-r border-b border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-600 last:border-r-0"
                >
                  {row.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              {rows.map((row) => (
                <td
                  key={row.label}
                  className="border-r border-slate-200 px-4 py-3 text-left text-base font-semibold text-slate-950 last:border-r-0"
                >
                  <span className={row.accent ?? "text-slate-950"}>
                    {row.value}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
