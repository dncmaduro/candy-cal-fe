import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ActionIcon, Menu, Select, Tooltip } from "@mantine/core"
import { IconDots, IconDownload, IconEye } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { useSalesItems } from "../../../hooks/useSalesItems"
import { GetDailySalesInventoryReportHistoryResponse } from "../../../hooks/models"
import { CDataTable } from "../../common/CDataTable"
import { CToast } from "../../common/CToast"
import { SalesInventoryDailyReportModal } from "../SalesInventoryDailyReportModal"

type InventoryReportDay =
  GetDailySalesInventoryReportHistoryResponse["data"][number]

export const SalesInventoryReports = () => {
  const today = new Date()
  const [month, setMonth] = useState(String(today.getMonth() + 1))
  const [year, setYear] = useState(String(today.getFullYear()))
  const {
    downloadDailySalesInventoryReport,
    getDailySalesInventoryReportHistory
  } = useSalesItems()
  const { data, isLoading } = useQuery({
    queryKey: ["salesInventory", "daily-reports", month, year],
    queryFn: () =>
      getDailySalesInventoryReportHistory(Number(month), Number(year))
  })
  const reports = data?.data.data ?? []
  const downloadMutation = useMutation({
    mutationFn: (date: Date) => downloadDailySalesInventoryReport(date),
    onSuccess: (response, date) => {
      const blob = response.data
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `bao-cao-ton-kho-${format(date, "yyyy-MM-dd")}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    onError: () => CToast.error({ title: "Không thể tải báo cáo tồn kho" })
  })

  const openWebReport = (date: Date) => {
    modals.open({
      title: <b>Báo cáo tồn kho hàng ngày</b>,
      children: (
        <SalesInventoryDailyReportModal initialDate={date} />
      ),
      size: "xl"
    })
  }

  const columns: ColumnDef<InventoryReportDay>[] = [
    {
      accessorKey: "date",
      header: "Ngày",
      cell: ({ row }) => format(new Date(row.original.date), "dd/MM/yyyy")
    },
    {
      accessorKey: "importedQuantity",
      header: "Nhập",
      meta: { isNumeric: true },
      cell: ({ row }) => row.original.importedQuantity.toLocaleString("vi-VN")
    },
    {
      accessorKey: "exportedQuantity",
      header: "Xuất",
      meta: { isNumeric: true },
      cell: ({ row }) => row.original.exportedQuantity.toLocaleString("vi-VN")
    },
    {
      id: "actions",
      header: "Thao tác",
      enableSorting: false,
      cell: ({ row }) => {
        const reportDate = new Date(row.original.date)
        return (
          <Menu shadow="md" width={180} position="bottom-end">
            <Menu.Target>
              <Tooltip label="Thao tác" withArrow>
                <ActionIcon variant="subtle" color="blue">
                  <IconDots size={18} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEye size={16} />}
                onClick={() => openWebReport(reportDate)}
              >
                Xem trên web
              </Menu.Item>
              <Menu.Item
                leftSection={<IconDownload size={16} />}
                onClick={() => downloadMutation.mutate(reportDate)}
                disabled={downloadMutation.isPending}
              >
                Tải file XLSX
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )
      }
    }
  ]

  return (
    <CDataTable
      columns={columns}
      data={reports}
      isLoading={isLoading}
      hideSearch
      extraFilters={
        <>
          <Select
            label="Tháng"
            value={month}
            data={Array.from({ length: 12 }, (_, index) => ({
              value: String(index + 1),
              label: `Tháng ${index + 1}`
            }))}
            onChange={(value) =>
              setMonth(value || String(today.getMonth() + 1))
            }
          />
          <Select
            label="Năm"
            value={year}
            data={Array.from({ length: 5 }, (_, index) => ({
              value: String(today.getFullYear() - index),
              label: String(today.getFullYear() - index)
            }))}
            onChange={(value) => setYear(value || String(today.getFullYear()))}
          />
        </>
      }
    />
  )
}
