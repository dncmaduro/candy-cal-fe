import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestreamEmployees } from "../../../hooks/useLivestreamEmployees"
import { useState } from "react"
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
  Text,
  Badge,
  Select
} from "@mantine/core"
import { IconEdit, IconUserPlus } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { Can } from "../../../components/common/Can"
import { LivestreamEmployeeModal } from "../../../components/livestream/LivestreamEmployeeModal"

export const Route = createFileRoute("/livestream/members/")({
  component: RouteComponent
})

function RouteComponent() {
  const { searchLivestreamEmployees } = useLivestreamEmployees()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
    undefined
  )

  const {
    data: employeesData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["searchLivestreamEmployees", page, limit, activeFilter],
    queryFn: () =>
      searchLivestreamEmployees({
        page,
        limit,
        active: activeFilter
      }),
    select: (data) => data.data,
    refetchOnWindowFocus: true
  })

  const colCount = 4

  const openEmployeeModal = (employee?: {
    _id: string
    name: string
    active?: boolean
  }) => {
    modals.open({
      title: <b>{employee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}</b>,
      children: (
        <LivestreamEmployeeModal employee={employee} refetch={refetch} />
      ),
      size: "md"
    })
  }

  const activeOptions = [
    { label: "Tất cả", value: "" },
    { label: "Hoạt động", value: "true" },
    { label: "Không hoạt động", value: "false" }
  ]

  return (
    <LivestreamLayout>
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
              Quản lý nhân viên livestream
            </Text>
            <Text c="dimmed" fz="sm">
              Quản lý danh sách nhân viên tham gia livestream
            </Text>
          </Box>
          <Can roles={["admin", "livestream-leader"]}>
            <Button
              onClick={() => openEmployeeModal()}
              leftSection={<IconUserPlus size={16} />}
              size="md"
              radius={"xl"}
            >
              Thêm nhân viên
            </Button>
          </Can>
        </Flex>
        <Divider my={0} />

        {/* Filters */}
        <Box px={{ base: 8, md: 28 }} py={16}>
          <Group gap={16} align="end">
            <Select
              label="Trạng thái"
              data={activeOptions}
              value={
                activeFilter === undefined
                  ? ""
                  : activeFilter
                    ? "true"
                    : "false"
              }
              onChange={(val) =>
                setActiveFilter(
                  val === "" ? undefined : val === "true" ? true : false
                )
              }
              size="md"
              placeholder="Lọc theo trạng thái"
              clearable
              style={{ minWidth: 160 }}
            />
          </Group>
        </Box>

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
            miw={600}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tên nhân viên</Table.Th>
                <Table.Th>Trạng thái</Table.Th>
                <Table.Th style={{ width: 120 }}>Hành động</Table.Th>
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
              ) : employeesData?.data && employeesData.data.length > 0 ? (
                employeesData.data.map((employee) => (
                  <Table.Tr key={employee._id}>
                    <Table.Td>
                      <Text fw={600}>{employee.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={employee.active !== false ? "green" : "gray"}
                        variant="light"
                      >
                        {employee.active !== false ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={8}>
                        <Can roles={["admin", "livestream-leader"]}>
                          <Button
                            variant="light"
                            color="indigo"
                            size="xs"
                            radius="xl"
                            leftSection={<IconEdit size={16} />}
                            onClick={() => openEmployeeModal(employee)}
                          >
                            Sửa
                          </Button>
                        </Can>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={colCount}>
                    <Flex justify="center" align="center" h={60}>
                      <Text c="dimmed">Không có nhân viên nào</Text>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>

          <Flex justify="space-between" align={"center"} mt={16}>
            <Text c="dimmed" mr={8}>
              Tổng số dòng: {employeesData?.total}
            </Text>
            <Pagination
              total={Math.ceil((employeesData?.total ?? 1) / limit)}
              value={page}
              onChange={setPage}
            />
            <Group>
              <Text>Số dòng/trang </Text>
              <NumberInput
                value={limit}
                onChange={(val) => setLimit(Number(val))}
                w={100}
                min={5}
                max={100}
              />
            </Group>
          </Flex>
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
