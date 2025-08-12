import {
  Box,
  Divider,
  Flex,
  Group,
  Loader,
  rem,
  Select,
  Table,
  Tabs,
  Text
} from "@mantine/core"
import { MonthPickerInput } from "@mantine/dates"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useLogs } from "../../hooks/useLogs"
import { DailyMatrixTable } from "./DailyMatrixTable"
import {
  DELIVERED_TAG_OPTIONS,
  RECEIVED_TAG_OPTION
} from "../../constants/tags"

interface Props {
  activeTab: string
}

export const MonthlyExports = ({ activeTab }: Props) => {
  const [month, setMonth] = useState<Date | null>(new Date())
  const [tag, setTag] = useState<string | null>("")
  const { getStorageLogsByMonth } = useLogs()
  const TAG_OPTIONS = [
    { value: "", label: "Tất cả" },
    ...DELIVERED_TAG_OPTIONS,
    ...RECEIVED_TAG_OPTION
  ]

  const { data: monthlogsData, isFetching } = useQuery({
    queryKey: ["getStorageLogsByMonth", month, activeTab, tag],
    queryFn: () => {
      return getStorageLogsByMonth(
        month
          ? {
              month: month.getMonth() + 1,
              year: month.getFullYear(),
              tag: tag ?? undefined
            }
          : {
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
              tag: tag ?? undefined
            }
      )
    },
    enabled: !!month,
    select: (data) => data.data
  })

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      maw="100%"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: rem(20),
        boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
        border: "1px solid #ececec"
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        pt={32}
        pb={8}
        px={{ base: 8, md: 28 }}
        direction={{ base: "column", sm: "row" }}
        gap={8}
      >
        <Box>
          <Text fw={700} fz="xl" mb={2}>
            Xem xuất kho theo tháng
          </Text>
          <Text c="dimmed" fz="sm">
            Xem danh sách xuất kho theo tháng
          </Text>
        </Box>

        <Group>
          <Select
            data={TAG_OPTIONS}
            value={tag}
            onChange={setTag}
            label="Trạng thái"
          />
          <MonthPickerInput
            value={month}
            onChange={setMonth}
            valueFormat="MM/YYYY"
            label="Chọn tháng"
            w={200}
          />
        </Group>
      </Flex>

      <Divider my={0} />

      <Box maw={"100%"} className="w-box">
        <Tabs
          px={{ base: 4, md: 28 }}
          py={14}
          variant="outline"
          defaultValue={"month"}
        >
          <Tabs.List>
            <Tabs.Tab value="month">Tổng hợp cả tháng</Tabs.Tab>
            <Tabs.Tab value="daily">Tổng hợp theo ngày</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="month">
            <Box py={16} px={8} w="100%" mt={16}>
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                verticalSpacing="sm"
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Tên mặt hàng</Table.Th>
                    <Table.Th>Nhập kho</Table.Th>
                    <Table.Th>Xuất kho</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {isFetching ? (
                    <Table.Tr>
                      <Table.Td colSpan={3}>
                        <Flex justify="center" align="center" h={60}>
                          <Loader />
                        </Flex>
                      </Table.Td>
                    </Table.Tr>
                  ) : monthlogsData?.items && monthlogsData.items.length > 0 ? (
                    monthlogsData.items.map((item) => (
                      <Table.Tr key={item._id}>
                        <Table.Td>{item.name}</Table.Td>
                        <Table.Td>{item.receivedQuantity}</Table.Td>
                        <Table.Td>{item.deliveredQuantity}</Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={3}>
                        <Text c="dimmed" ta="center">
                          Không có dữ liệu cho tháng này
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="daily">
            <DailyMatrixTable
              month={month}
              data={monthlogsData}
              isFetching={isFetching}
            />
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Box>
  )
}
