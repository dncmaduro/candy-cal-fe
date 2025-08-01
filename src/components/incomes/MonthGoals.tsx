import { useState } from "react"
import { useMonthGoals } from "../../hooks/useMonthGoals"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Flex,
  Table,
  Loader,
  Text,
  Group,
  Divider,
  Button
} from "@mantine/core"
import { YearPickerInput } from "@mantine/dates"
import { IconEdit, IconPlus } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { MonthGoalModal } from "./MonthGoalModal"

export const MonthGoals = () => {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState<Date | null>(new Date())
  const { getGoals } = useMonthGoals()

  const {
    data: goalsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["getGoals", year],
    queryFn: () => getGoals({ year: year ? year.getFullYear() : undefined }),
    select: (data) => data.data
  })

  const monthGoals = goalsData?.monthGoals || []

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
      <Flex
        align="center"
        justify="space-between"
        pt={32}
        pb={8}
        px={{ base: 8, md: 28 }}
      >
        <Box>
          <Text fw={700} fz="xl" mb={2}>
            KPI doanh số tháng
          </Text>
          <Text c="dimmed" fz="sm">
            Xem KPI từng tháng trong năm
          </Text>
        </Box>
        <Group align="flex-end">
          <YearPickerInput
            label="Năm"
            value={year}
            onChange={(value) => setYear(value)}
            minDate={new Date(currentYear - 10, 0, 1)}
            maxDate={new Date(currentYear + 10, 0, 1)}
            size="md"
            radius="md"
            clearable
            style={{ width: 120 }}
          />
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
        </Group>
      </Flex>
      <Divider my={0} />
      <Box px={{ base: 4, md: 28 }} py={20}>
        <Table
          highlightOnHover
          striped
          withTableBorder
          withColumnBorders
          verticalSpacing="sm"
          horizontalSpacing="md"
          stickyHeader
          className="rounded-xl"
          miw={400}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 120 }}>Tháng</Table.Th>
              <Table.Th>KPI</Table.Th>
              <Table.Th>Doanh thu</Table.Th>
              <Table.Th>Số lượng sản phẩm</Table.Th>
              <Table.Th>Tỉ lệ đạt KPI</Table.Th>
              <Table.Th style={{ width: 180 }}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Flex justify="center" align="center" h={60}>
                    <Loader />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            ) : monthGoals.length > 0 ? (
              monthGoals.map((m) => (
                <Table.Tr key={m.month}>
                  <Table.Td>
                    {m.month + 1}/{m.year}
                  </Table.Td>
                  <Table.Td>{m.goal.toLocaleString()}</Table.Td>
                  <Table.Td>
                    {m.totalIncome ? m.totalIncome.toLocaleString() : 0}
                  </Table.Td>
                  <Table.Td>
                    {m.totalQuantity ? m.totalQuantity.toLocaleString() : 0}
                  </Table.Td>
                  <Table.Td>
                    {m.KPIPercentage !== undefined
                      ? `${m.KPIPercentage}%`
                      : "..."}
                  </Table.Td>
                  <Table.Td>
                    <Group>
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
                              <Text fw={700} className="!font-bold" fz="md">
                                Chỉnh sửa KPI
                              </Text>
                            ),
                            children: (
                              <MonthGoalModal monthGoal={m} refetch={refetch} />
                            )
                          })
                        }
                      >
                        Sửa
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Flex justify="center" align="center" h={60}>
                    <Text c="dimmed">Không có dữ liệu</Text>
                  </Flex>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
        <Flex justify="end" mt={16}>
          <Text fw={700}>
            Tổng mục tiêu năm:{" "}
            {monthGoals.reduce((sum, m) => sum + m.goal, 0).toLocaleString()}
          </Text>
        </Flex>
      </Box>
    </Box>
  )
}
