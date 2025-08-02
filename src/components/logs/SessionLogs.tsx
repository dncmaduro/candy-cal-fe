import { useState } from "react"
import { useSessionLogs } from "../../hooks/useSessionLogs"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Loader,
  NumberInput,
  Pagination,
  rem,
  Table,
  Text
} from "@mantine/core"
import { IconHistory, IconListDetails } from "@tabler/icons-react"
import { format } from "date-fns"
import { modals } from "@mantine/modals"
import { CalFileResultModal } from "../cal/CalFileResultModal"
import { Link } from "@tanstack/react-router"
import { NAVS_URL } from "../../constants/navs"

export const SessionLogs = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { getSessionLogs } = useSessionLogs()

  const { data: sessionLogsData, isLoading } = useQuery({
    queryKey: ["sessionLogs", page, limit],
    queryFn: () => getSessionLogs({ page, limit }),
    select: (data) => data.data,
    refetchOnWindowFocus: true
  })

  const colCount = 4

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: rem(20),
        boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
        border: "1px solid #ececec"
      }}
    >
      <Flex
        align="flex-start"
        justify="space-between"
        pt={32}
        pb={8}
        px={{ base: 8, md: 28 }}
        direction="row"
        gap={8}
      >
        <Box>
          <Text fw={700} fz="xl" mb={2}>
            Nhật ký kho theo ca
          </Text>
          <Text c="dimmed" fz="sm">
            Quản lý các log nhập xuất kho, điều chỉnh số lượng theo ca
          </Text>
        </Box>
        <Button
          component={Link}
          to={`${NAVS_URL}/orders-logs`}
          variant="outline"
          leftSection={<IconHistory size={16} />}
          size="md"
          radius={"xl"}
          color="orange"
        >
          Xem lại log cũ
        </Button>
      </Flex>
      <Divider my={0} />
      <Box px={{ base: 4, md: 28 }} py={20}>
        <Table
          highlightOnHover
          striped
          withColumnBorders
          withTableBorder
          verticalSpacing="sm"
          horizontalSpacing="md"
          stickyHeader
          className="rounded-xl"
          miw={900}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Thời gian</Table.Th>
              <Table.Th>Số mặt hàng</Table.Th>
              <Table.Th>Số đơn hàng</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={colCount}>
                  <Flex justify="center" align="center" h={60}>
                    <Loader />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            ) : sessionLogsData?.data && sessionLogsData.data.length > 0 ? (
              sessionLogsData.data.map((log) => (
                <Table.Tr key={log._id}>
                  <Table.Td>
                    {format(new Date(log.time), "dd/MM/yyyy HH:mm:ss")}
                  </Table.Td>
                  <Table.Td>{log.items?.length || 0}</Table.Td>
                  <Table.Td>{log.orders?.length || 0}</Table.Td>
                  <Table.Td>
                    <Group gap={8}>
                      <Button
                        variant="light"
                        size="xs"
                        radius={"xl"}
                        leftSection={<IconListDetails size={14} />}
                        onClick={() =>
                          modals.open({
                            title: (
                              <b>
                                Chi tiết log kho theo ca{" "}
                                {format(
                                  new Date(log.time),
                                  "dd/MM/yyyy HH:ii:ss"
                                )}
                              </b>
                            ),
                            children: (
                              <CalFileResultModal
                                items={log.items}
                                orders={log.orders}
                                readOnly
                              />
                            ),
                            size: "xl"
                          })
                        }
                      >
                        Chi tiết
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={colCount}>
                  <Flex justify="center" align="center" h={60}>
                    <Text c="dimmed">Không có log kho nào</Text>
                  </Flex>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        <Flex justify="space-between" align={"center"} mt={16}>
          <Text c="dimmed" mr={8}>
            Tổng số dòng: {sessionLogsData?.total}
          </Text>
          <Pagination
            total={Math.ceil((sessionLogsData?.total ?? 1) / limit)}
            value={page}
            onChange={setPage}
          />
          <Group>
            <Text>Số dòng/trang </Text>
            <NumberInput
              value={limit}
              onChange={(val) => setLimit(Number(val))}
              w={100}
            />
          </Group>
        </Flex>
      </Box>
    </Box>
  )
}
