import {
  Box,
  Table,
  Text,
  Loader,
  Flex,
  ScrollArea,
  Group,
  Select
} from "@mantine/core"
import { useMemo, useState } from "react"
import { GetStorageLogsByMonthResponse } from "../../hooks/models"
import React from "react"

// type: GetStorageLogsByMonthResponse như bạn gửi

interface Props {
  data: GetStorageLogsByMonthResponse | undefined
  isFetching: boolean
  month: Date | null
}

export const DailyMatrixTable = ({ data, isFetching, month }: Props) => {
  // Tổng số ngày trong tháng này
  const daysInMonth = useMemo(() => {
    if (!month) return 31
    const y = month.getFullYear()
    const m = month.getMonth()
    return new Date(y, m + 1, 0).getDate()
  }, [month])

  // Map: itemId -> {name, [day]: {delivered, received}}
  const itemMap = useMemo(() => {
    const map: Record<
      string,
      {
        name: string
        daily: Record<
          number,
          { deliveredQuantity: number; receivedQuantity: number }
        >
      }
    > = {}
    if (!data) return map
    data.items.forEach((it) => {
      map[it._id] = { name: it.name, daily: {} }
    })
    // merge daily
    data.byDay?.forEach((d) => {
      d.items.forEach((it) => {
        if (!map[it._id]) {
          map[it._id] = { name: it.name, daily: {} }
        }
        map[it._id].daily[d.day] = {
          deliveredQuantity: it.deliveredQuantity,
          receivedQuantity: it.receivedQuantity
        }
      })
    })
    return map
  }, [data])

  const itemList = useMemo(() => Object.entries(itemMap), [itemMap])

  const viewOptions = [
    {
      label: "Chỉ xuất",
      value: "delivered"
    },
    {
      label: "Chỉ nhập",
      value: "received"
    },
    {
      label: "Cả nhập và xuất",
      value: "both"
    }
  ]

  const [view, setView] = useState<string | null>(viewOptions[0].value)

  const renderHeaderCols = () => {
    if (view === "both") {
      return [...Array(daysInMonth)].map((_, idx) => (
        <Table.Th
          key={idx + 1}
          colSpan={2}
          style={{ minWidth: 60, textAlign: "center" }}
        >
          {idx + 1}/{month ? month?.getMonth() + 1 : ""}/{month?.getFullYear()}
        </Table.Th>
      ))
    } else {
      return [...Array(daysInMonth)].map((_, idx) => (
        <Table.Th key={idx + 1} style={{ minWidth: 60, textAlign: "center" }}>
          {idx + 1}/{month ? month?.getMonth() + 1 : ""}/{month?.getFullYear()}
        </Table.Th>
      ))
    }
  }

  const renderHeaderSubs = () => {
    if (view === "both") {
      return [...Array(daysInMonth)].map((_, idx) => (
        <React.Fragment key={idx}>
          <Table.Th c="teal.7" style={{ fontSize: 13 }}>
            Nhập
          </Table.Th>
          <Table.Th c="indigo.7" style={{ fontSize: 13 }}>
            Xuất
          </Table.Th>
        </React.Fragment>
      ))
    }
    return null
  }

  const renderRowCells = (val: any) => {
    if (view === "both") {
      return [...Array(daysInMonth)].map((_, idx) => {
        const d = idx + 1
        const daily = val.daily[d] || {
          deliveredQuantity: 0,
          receivedQuantity: 0
        }
        return (
          <React.Fragment key={d}>
            <Table.Td ta="center" c="teal.8" fz={14}>
              {daily.receivedQuantity || ""}
            </Table.Td>
            <Table.Td ta="center" c="indigo.8" fz={14}>
              {daily.deliveredQuantity || ""}
            </Table.Td>
          </React.Fragment>
        )
      })
    } else if (view === "delivered") {
      return [...Array(daysInMonth)].map((_, idx) => {
        const d = idx + 1
        const daily = val.daily[d] || { deliveredQuantity: 0 }
        return (
          <Table.Td ta="center" c="indigo.8" fz={14} key={d}>
            {daily.deliveredQuantity || ""}
          </Table.Td>
        )
      })
    } else {
      // received
      return [...Array(daysInMonth)].map((_, idx) => {
        const d = idx + 1
        const daily = val.daily[d] || { receivedQuantity: 0 }
        return (
          <Table.Td ta="center" c="teal.8" fz={14} key={d}>
            {daily.receivedQuantity || ""}
          </Table.Td>
        )
      })
    }
  }

  const totalCols = 1 + daysInMonth * (view === "both" ? 2 : 1)

  return (
    <Box py={16} px={8} maw="100%" mt={16}>
      <Group justify="flex-end" mb={16}>
        <Select
          data={viewOptions}
          label="Xem theo"
          value={view}
          allowDeselect={false}
          onChange={setView}
        />
      </Group>
      <ScrollArea scrollbars="x" type="always" w="100%" pb={8}>
        <Table
          highlightOnHover
          withColumnBorders
          withTableBorder
          stickyHeader
          miw={Math.max(820, daysInMonth * (view === "both" ? 72 : 44))}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th
                rowSpan={view === "both" ? 2 : 1}
                style={{
                  minWidth: 200,
                  position: "sticky",
                  left: 0,
                  background: "#fff",
                  zIndex: 2
                }}
              >
                Tên mặt hàng
              </Table.Th>
              {renderHeaderCols()}
            </Table.Tr>
            {view === "both" && <Table.Tr>{renderHeaderSubs()}</Table.Tr>}
          </Table.Thead>
          <Table.Tbody>
            {isFetching ? (
              <Table.Tr>
                <Table.Td colSpan={totalCols}>
                  <Flex justify="center" align="center" h={60}>
                    <Loader />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            ) : itemList.length > 0 ? (
              itemList.map(([itemId, val]) => (
                <Table.Tr key={itemId}>
                  <Table.Td
                    fw={600}
                    style={{
                      background: "#f5f6fa",
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      minWidth: 200
                    }}
                  >
                    {val.name}
                  </Table.Td>
                  {renderRowCells(val)}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={totalCols}>
                  <Text c="dimmed" ta="center">
                    Không có dữ liệu cho tháng này
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Box>
  )
}
