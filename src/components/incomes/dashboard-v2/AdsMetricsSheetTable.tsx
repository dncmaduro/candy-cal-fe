import { useMemo, useState } from "react"
import type { GetAdsCostSplitByMonthResponse } from "../../../hooks/models"
import { formatCurrency, formatPercent } from "./helpers"

type TableMode = "compact" | "full"

type SheetColumn = {
  key: string
  sheetColumn: string
  label: string
  value: number
  format: "currency" | "percent"
}

const COMPACT_COLUMN_KEYS = new Set([
  "actualAdsCost",
  "totalCost",
  "adsRatio",
  "totalCostRatio",
  "costAfterRefundRatio"
])

const formatValue = (column: SheetColumn) =>
  column.format === "currency"
    ? formatCurrency(column.value)
    : formatPercent(column.value)

export function AdsMetricsSheetTable({
  data,
  monthLabel
}: {
  data?: GetAdsCostSplitByMonthResponse
  monthLabel: string
}) {
  const [mode, setMode] = useState<TableMode>("compact")

  const columns = useMemo<SheetColumn[]>(() => {
    const rawMetrics = data?.rawMetrics

    return [
      {
        key: "roiProtect",
        sheetColumn: "B",
        label: "ROI Protect",
        value: rawMetrics?.roiProtect ?? 0,
        format: "currency"
      },
      {
        key: "fullRefundGmv",
        sheetColumn: "C",
        label: "GMV hoàn 100%",
        value: rawMetrics?.fullRefundGmv ?? 0,
        format: "currency"
      },
      {
        key: "tinRefundAmount",
        sheetColumn: "D",
        label: "Tiền tín hoàn về",
        value: rawMetrics?.tinRefundAmount ?? 0,
        format: "currency"
      },
      {
        key: "adsTax",
        sheetColumn: "E",
        label: "TQLQC",
        value: rawMetrics?.adsTax ?? 0,
        format: "currency"
      },
      {
        key: "gmvAds",
        sheetColumn: "F",
        label: "GMV Ads",
        value: rawMetrics?.gmvAds ?? 0,
        format: "currency"
      },
      {
        key: "actualAdsCost",
        sheetColumn: "G",
        label: "Chi phí ads thực tế",
        value: data?.actualAdsCost ?? 0,
        format: "currency"
      },
      {
        key: "affiliateCost",
        sheetColumn: "H",
        label: "Chi phí affiliate",
        value: rawMetrics?.affiliateCost ?? 0,
        format: "currency"
      },
      {
        key: "affiliateRefundAmount",
        sheetColumn: "I",
        label: "AFF - Hoàn huỷ",
        value: rawMetrics?.affiliateRefundAmount ?? 0,
        format: "currency"
      },
      {
        key: "totalCost",
        sheetColumn: "J",
        label: "Chi phí ads thực tế + aff",
        value: data?.totalCost ?? 0,
        format: "currency"
      },
      {
        key: "incomeBeforeDiscount",
        sheetColumn: "K",
        label: "Doanh thu tổng",
        value: rawMetrics?.incomeBeforeDiscount ?? 0,
        format: "currency"
      },
      {
        key: "adsRatio",
        sheetColumn: "L",
        label: "Chi phí ads thực tế / DS",
        value: data?.ratios?.adsRatioOnBeforeDiscountRevenue ?? 0,
        format: "percent"
      },
      {
        key: "totalCostRatio",
        sheetColumn: "M",
        label: "Chi phí ads thực tế + aff / DS",
        value: data?.ratios?.totalCostRatioOnBeforeDiscountRevenue ?? 0,
        format: "percent"
      },
      {
        key: "affiliateRatio",
        sheetColumn: "N",
        label: "Aff / DS",
        value: data?.ratios?.affiliateRatioOnBeforeDiscountRevenue ?? 0,
        format: "percent"
      },
      {
        key: "costAfterRefund",
        sheetColumn: "O",
        label: "Chi phí đã trừ hoàn huỷ",
        value: data?.costAfterRefund ?? 0,
        format: "currency"
      },
      {
        key: "costAfterRefundRatio",
        sheetColumn: "P",
        label: "Chi phí đã trừ hoàn huỷ / DS",
        value: data?.ratios?.costAfterRefundRatioOnBeforeDiscountRevenue ?? 0,
        format: "percent"
      }
    ]
  }, [data])

  const visibleColumns =
    mode === "compact"
      ? columns.filter((column) => COMPACT_COLUMN_KEYS.has(column.key))
      : columns

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
              Chỉ số ads
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Bảng chỉ số theo mẫu sheet vận hành
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Tổng hợp tháng {monthLabel}. Chế độ thu gọn dùng các cột G, J, L,
              M, P như file mẫu.
            </p>
          </div>

          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === "compact"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white"
              }`}
              onClick={() => setMode("compact")}
            >
              Thu gọn
            </button>
            <button
              type="button"
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === "full"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white"
              }`}
              onClick={() => setMode("full")}
            >
              Xem full
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50">
                {visibleColumns.map((column, index) => (
                  <th
                    key={column.key}
                    className={`min-w-[180px] border-b border-slate-200 px-4 py-3 text-left align-top ${
                      index < visibleColumns.length - 1
                        ? "border-r border-slate-200"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-slate-900">
                        {column.label}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                {visibleColumns.map((column, index) => (
                  <td
                    key={column.key}
                    className={`px-4 py-4 ${
                      index < visibleColumns.length - 1
                        ? "border-r border-slate-200"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-semibold text-slate-950">
                        {formatValue(column)}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
