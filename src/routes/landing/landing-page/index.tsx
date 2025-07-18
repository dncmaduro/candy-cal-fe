import { createFileRoute } from "@tanstack/react-router"
import { useLanding } from "../../../hooks/useLanding"
import { useQuery } from "@tanstack/react-query"
import { Box, Table, Text, Flex, rem, Pagination, Divider } from "@mantine/core"
import { useState } from "react"
import { LandingLayout } from "../../../components/layouts/LandingLayout"
import { format } from "date-fns"

export const Route = createFileRoute("/landing/landing-page/")({
  component: RouteComponent
})

const PAGE_SIZE = 10

function RouteComponent() {
  const { getLandingData } = useLanding()
  const [page, setPage] = useState(1)

  const {
    data: landingResp = { data: [], total: 0, page: 1, pageSize: PAGE_SIZE },
    isLoading
  } = useQuery({
    queryKey: ["landing-data", page, PAGE_SIZE],
    queryFn: () => getLandingData({ page, pageSize: PAGE_SIZE }),
    select: (data) => data.data
  })

  return (
    <LandingLayout>
      <Box
        mx="auto"
        mt={40}
        w="100%"
        px={{ base: 8, md: 0 }}
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
        >
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              Danh sách Landing Orders
            </Text>
            <Text c="dimmed" fz="sm">
              Hiển thị thông tin các order từ landing page
            </Text>
          </Box>
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
            miw={500}
          >
            <Table.Thead bg="indigo.0">
              <Table.Tr>
                <Table.Th>Họ tên</Table.Th>
                <Table.Th>SĐT</Table.Th>
                <Table.Th>Công ty</Table.Th>
                <Table.Th>Số lượng</Table.Th>
                <Table.Th>Địa chỉ</Table.Th>
                <Table.Th>Thời gian đặt</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Flex justify="center" align="center" h={60}>
                      <Text c="dimmed">Đang tải dữ liệu...</Text>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ) : landingResp.data && landingResp.data.length > 0 ? (
                landingResp.data.map((item: any) => (
                  <Table.Tr key={item._id}>
                    <Table.Td>
                      {item.fullName || <Text c="red">?</Text>}
                    </Table.Td>
                    <Table.Td>
                      {item.phoneNumber || <Text c="red">?</Text>}
                    </Table.Td>
                    <Table.Td>
                      {item.company || (
                        <Text c="gray.6" fz="sm">
                          -
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {item.quantity || (
                        <Text c="gray.6" fz="sm">
                          -
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {item.address || (
                        <Text c="gray.6" fz="sm">
                          -
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {format(
                        new Date(item.created_at),
                        "dd/MM/yyyy HH:mm"
                      ) || (
                        <Text c="gray.6" fz="sm">
                          -
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Flex justify="center" align="center" h={60}>
                      <Text c="dimmed">Không có dữ liệu</Text>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
          <Flex justify="end" mt={20}>
            <Pagination
              total={Math.ceil(landingResp.total / PAGE_SIZE)}
              value={page}
              onChange={setPage}
              size="md"
              radius="xl"
              siblings={1}
              boundaries={1}
              withEdges
              disabled={landingResp.total <= PAGE_SIZE}
            />
          </Flex>
        </Box>
      </Box>
    </LandingLayout>
  )
}
