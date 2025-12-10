import { useState, useMemo } from "react"
import { useMonthGoals } from "../../hooks/useMonthGoals"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Text,
  Group,
  Divider,
  Button,
  SegmentedControl,
  Badge
} from "@mantine/core"
import { YearPickerInput } from "@mantine/dates"
import { IconEdit, IconPlus } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { MonthGoalModal } from "./MonthGoalModal"
import { Can } from "../common/Can"
import { CDataTable } from "../common/CDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { useLivestreamChannel } from "../../context/LivestreamChannelContext"

type MonthGoalRow = {
  month: number
  year: number
  channel: {
    _id: string
    name: string
  }
  liveStreamGoal: number
  shopGoal: number
  liveAdsPercentageGoal: number
  shopAdsPercentageGoal: number
  totalIncome: {
    beforeDiscount: { live: number; shop: number }
    afterDiscount: { live: number; shop: number }
  }
  KPIPercentage: {
    beforeDiscount: { live: number; shop: number }
    afterDiscount: { live: number; shop: number }
  }
}

export const MonthGoals = () => {
  const currentYear = new Date().getFullYear()
  type DiscountMode = "beforeDiscount" | "afterDiscount"
  const [mode, setMode] = useState<DiscountMode>("afterDiscount")
  const [year, setYear] = useState<Date | null>(new Date())

  const { getGoals } = useMonthGoals()
  const { selectedChannelId } = useLivestreamChannel()

  const {
    data: goalsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["getGoals", year, selectedChannelId],
    queryFn: () =>
      getGoals({
        year: year ? year.getFullYear() : undefined,
        channelId: selectedChannelId || undefined
      }),
    select: (data) => data.data
  })

  const monthGoals = goalsData?.monthGoals || []

  const totalYearGoal = monthGoals.reduce(
    (sum, m) => sum + (m.liveStreamGoal || 0) + (m.shopGoal || 0),
    0
  )

  const columns = useMemo<ColumnDef<MonthGoalRow>[]>(
    () => [
      {
        accessorKey: "month",
        header: "Tháng",
        size: 120,
        cell: ({ row }) => (
          <Text size="sm">
            {row.original.month + 1}/{row.original.year}
          </Text>
        )
      },
      {
        accessorKey: "channel",
        header: "Kênh",
        size: 150,
        cell: ({ row }) => (
          <Badge color="blue" variant="light" size="sm">
            {row.original.channel.name || "N/A"}
          </Badge>
        )
      },
      {
        accessorKey: "liveStreamGoal",
        header: "KPI Live",
        size: 120,
        cell: ({ getValue }) => (
          <Text size="sm">{getValue<number>()?.toLocaleString?.() || 0}</Text>
        )
      },
      {
        accessorKey: "shopGoal",
        header: "KPI Shop",
        size: 120,
        cell: ({ getValue }) => (
          <Text size="sm">{getValue<number>()?.toLocaleString?.() || 0}</Text>
        )
      },
      {
        accessorKey: "liveAdsPercentageGoal",
        header: "KPI % Ads Live",
        size: 130,
        cell: ({ getValue }) => (
          <Text size="sm">{getValue<number>() || 0}%</Text>
        )
      },
      {
        accessorKey: "shopAdsPercentageGoal",
        header: "KPI % Ads Shop",
        size: 130,
        cell: ({ getValue }) => (
          <Text size="sm">{getValue<number>() || 0}%</Text>
        )
      },
      {
        id: "totalIncome",
        header: "Tổng doanh thu",
        size: 150,
        cell: ({ row }) => (
          <Text size="sm" fw={500}>
            {(
              (row.original.totalIncome?.[mode]?.live || 0) +
              (row.original.totalIncome?.[mode]?.shop || 0)
            ).toLocaleString?.()}{" "}
            VNĐ
          </Text>
        )
      },
      {
        id: "kpiPercentage",
        header: "KPI % (Live/Shop)",
        size: 150,
        cell: ({ row }) => (
          <Text size="sm">
            {row.original.KPIPercentage?.[mode]?.live ?? 0}% /{" "}
            {row.original.KPIPercentage?.[mode]?.shop ?? 0}%
          </Text>
        )
      },
      {
        id: "actions",
        header: "",
        size: 140,
        cell: ({ row }) => (
          <Can roles={["admin", "accounting-emp"]}>
            <Button
              variant="light"
              color="indigo"
              size="xs"
              radius="xl"
              leftSection={<IconEdit size={16} />}
              onClick={() =>
                modals.open({
                  size: "lg",
                  title: (
                    <Text fw={700} fz="md">
                      Chỉnh sửa KPI
                    </Text>
                  ),
                  children: (
                    <MonthGoalModal
                      monthGoal={{
                        month: row.original.month,
                        year: row.original.year,
                        channel: row.original.channel._id,
                        liveStreamGoal: row.original.liveStreamGoal,
                        shopGoal: row.original.shopGoal,
                        liveAdsPercentageGoal:
                          row.original.liveAdsPercentageGoal,
                        shopAdsPercentageGoal:
                          row.original.shopAdsPercentageGoal
                      }}
                      refetch={refetch}
                    />
                  )
                })
              }
            >
              Sửa
            </Button>
          </Can>
        )
      }
    ],
    [mode, refetch]
  )

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: 20,
        boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
        border: "1px solid #ececec"
      }}
    >
      <Box pt={32} pb={16} px={{ base: 8, md: 28 }}>
        <Group justify="space-between" align="flex-start" mb="md">
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              KPI doanh số tháng
            </Text>
            <Text c="dimmed" fz="sm">
              Xem KPI từng tháng trong năm
            </Text>
          </Box>
          <Can roles={["admin", "accounting-emp"]}>
            <Button
              leftSection={<IconPlus size={16} />}
              color="indigo"
              radius="xl"
              size="md"
              px={18}
              fw={600}
              onClick={() => {
                modals.open({
                  title: <b>Tạo KPI mới</b>,
                  children: <MonthGoalModal refetch={refetch} />,
                  size: "lg"
                })
              }}
            >
              Tạo KPI mới
            </Button>
          </Can>
        </Group>
      </Box>
      <Divider my={0} />
      <Box px={{ base: 4, md: 28 }} py={20}>
        <CDataTable
          columns={columns}
          data={monthGoals as MonthGoalRow[]}
          isLoading={isLoading}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          initialPageSize={100}
          extraFilters={
            <>
              <YearPickerInput
                label="Năm"
                value={year}
                onChange={(value) => setYear(value)}
                minDate={new Date(currentYear - 10, 0, 1)}
                maxDate={new Date(currentYear + 10, 0, 1)}
                size="sm"
                radius="md"
                clearable
                style={{ width: 120 }}
              />
              <SegmentedControl
                value={mode}
                onChange={(v) => setMode(v as DiscountMode)}
                data={[
                  { label: "Sau giảm giá", value: "afterDiscount" },
                  { label: "Trước giảm giá", value: "beforeDiscount" }
                ]}
                size="sm"
              />
            </>
          }
        />
        <Group justify="space-between" mt={16}>
          <Text c="dimmed" fz="sm">
            (Live + Shop)
          </Text>
          <Text fw={700}>
            Tổng mục tiêu năm: {totalYearGoal.toLocaleString()}
          </Text>
        </Group>
      </Box>
    </Box>
  )
}
