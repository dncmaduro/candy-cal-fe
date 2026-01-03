import { createFileRoute } from "@tanstack/react-router"
import { LivestreamLayout } from "../../../components/layouts/LivestreamLayout"
import { useLivestreamSalary } from "../../../hooks/useLivestreamSalary"
import { useLivestreamPerformance } from "../../../hooks/useLivestreamPerformance"
import { useUsers } from "../../../hooks/useUsers"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import {
  PublicSearchUsersResponse,
  SearchLivestreamPerformanceResponse,
  SearchLivestreamSalaryResponse
} from "../../../hooks/models"
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Stack,
  Text,
  rem,
  MultiSelect,
  TextInput,
  NumberInput
} from "@mantine/core"
import { useMemo, useState } from "react"
import { Can } from "../../../components/common/Can"
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react"
import { Controller, useForm } from "react-hook-form"
import { modals } from "@mantine/modals"
import { CToast } from "../../../components/common/CToast"
import { CDataTable } from "../../../components/common/CDataTable"

export const Route = createFileRoute("/livestream/salary/")({
  component: RouteComponent
})

type PerformanceRule = SearchLivestreamPerformanceResponse["data"][0]
type SalaryRule = SearchLivestreamSalaryResponse["data"][0] & { _id: string }

interface PerformanceFormData {
  minIncome: number
  maxIncome: number
  salaryPerHour: number
  bonusPercentage: number
}

interface SalaryFormData {
  name: string
  livestreamEmployees: string[]
  livestreamPerformances: string[]
}

function PerformanceModal({
  performance,
  refetch
}: {
  performance?: PerformanceRule
  refetch: () => void
}) {
  const { createLivestreamPerformance, updateLivestreamPerformance } =
    useLivestreamPerformance()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<PerformanceFormData>({
    defaultValues: {
      minIncome: performance?.minIncome || 0,
      maxIncome: performance?.maxIncome || 0,
      salaryPerHour: performance?.salaryPerHour || 0,
      bonusPercentage: performance?.bonusPercentage || 0
    }
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: createLivestreamPerformance,
    onSuccess: () => {
      CToast.success({ title: "Thêm bậc lương thành công" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi thêm bậc lương" })
    }
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateLivestreamPerformance(id, data),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật bậc lương thành công" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật bậc lương" })
    }
  })

  const onSubmit = (data: PerformanceFormData) => {
    if (performance) {
      update({ id: performance._id, data })
    } else {
      create(data)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <Group grow>
          <Controller
            control={control}
            name="minIncome"
            rules={{ required: "Vui lòng nhập doanh thu tối thiểu" }}
            render={({ field }) => (
              <NumberInput
                {...field}
                label="Doanh thu tối thiểu (VNĐ)"
                placeholder="Nhập doanh thu tối thiểu"
                error={errors.minIncome?.message}
                thousandSeparator=","
                min={0}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="maxIncome"
            rules={{ required: "Vui lòng nhập doanh thu tối đa" }}
            render={({ field }) => (
              <NumberInput
                {...field}
                label="Doanh thu tối đa (VNĐ)"
                placeholder="Nhập doanh thu tối đa"
                error={errors.maxIncome?.message}
                thousandSeparator=","
                min={0}
                required
              />
            )}
          />
        </Group>

        <Group grow>
          <Controller
            control={control}
            name="salaryPerHour"
            rules={{ required: "Vui lòng nhập lương theo giờ" }}
            render={({ field }) => (
              <NumberInput
                {...field}
                label="Lương theo giờ (VNĐ)"
                placeholder="Nhập lương theo giờ"
                error={errors.salaryPerHour?.message}
                thousandSeparator=","
                min={0}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="bonusPercentage"
            rules={{ required: "Vui lòng nhập % thưởng" }}
            render={({ field }) => (
              <NumberInput
                {...field}
                label="Phần trăm thưởng (%)"
                placeholder="Nhập % thưởng"
                error={errors.bonusPercentage?.message}
                min={0}
                max={100}
                decimalScale={2}
                required
              />
            )}
          />
        </Group>

        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            onClick={() => modals.closeAll()}
            disabled={creating || updating}
          >
            Hủy
          </Button>
          <Button type="submit" loading={creating || updating}>
            {performance ? "Cập nhật" : "Thêm mới"}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

function SalaryModal({
  salary,
  refetch,
  users,
  performances
}: {
  salary?: SalaryRule
  refetch: () => void
  users: PublicSearchUsersResponse["data"]
  performances: PerformanceRule[]
}) {
  const { createLivestreamSalary, updateLivestreamSalary } =
    useLivestreamSalary()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<SalaryFormData>({
    defaultValues: {
      name: salary?.name || "",
      livestreamEmployees: salary?.livestreamEmployees?.map((e) => e._id) || [],
      livestreamPerformances:
        salary?.livestreamPerformances?.map((p) => p._id) || []
    }
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: createLivestreamSalary,
    onSuccess: () => {
      CToast.success({ title: "Thêm cấu trúc lương thành công" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi thêm cấu trúc lương" })
    }
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateLivestreamSalary(id, data),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật cấu trúc lương thành công" })
      modals.closeAll()
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi cập nhật cấu trúc lương" })
    }
  })

  const onSubmit = (data: SalaryFormData) => {
    if (salary) {
      update({ id: salary._id, data })
    } else {
      create(data)
    }
  }

  console.log(users)

  const userOptions = (users || []).map((user) => ({
    value: user._id,
    label: user.name ?? ""
  }))

  const performanceOptions = performances.map((perf) => ({
    value: perf._id,
    label: `${new Intl.NumberFormat("vi-VN").format(
      perf.minIncome
    )} - ${new Intl.NumberFormat("vi-VN").format(perf.maxIncome)} VNĐ (${
      perf.salaryPerHour
    }đ/h, ${perf.bonusPercentage}%)`
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <Controller
          control={control}
          name="name"
          rules={{ required: "Vui lòng nhập tên cấu trúc" }}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Tên cấu trúc"
              placeholder="Nhập tên cấu trúc lương"
              error={errors.name?.message}
              required
            />
          )}
        />

        <Controller
          control={control}
          name="livestreamEmployees"
          rules={{ required: "Vui lòng chọn ít nhất 1 nhân viên" }}
          render={({ field }) => (
            <MultiSelect
              {...field}
              label="Nhân viên"
              placeholder="Chọn nhân viên áp dụng"
              data={userOptions}
              error={errors.livestreamEmployees?.message}
              searchable
              required
            />
          )}
        />

        <Controller
          control={control}
          name="livestreamPerformances"
          rules={{ required: "Vui lòng chọn ít nhất 1 bậc lương" }}
          render={({ field }) => (
            <MultiSelect
              {...field}
              label="Bậc lương áp dụng"
              placeholder="Chọn các bậc lương"
              data={performanceOptions}
              error={errors.livestreamPerformances?.message}
              searchable
              required
            />
          )}
        />

        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            onClick={() => modals.closeAll()}
            disabled={creating || updating}
          >
            Hủy
          </Button>
          <Button type="submit" loading={creating || updating}>
            {salary ? "Cập nhật" : "Thêm mới"}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

function RouteComponent() {
  const { searchLivestreamSalary, deleteLivestreamSalary } =
    useLivestreamSalary()
  const { searchLivestreamPerformance, deleteLivestreamPerformance } =
    useLivestreamPerformance()
  const { publicSearchUser } = useUsers()

  // Performance table state
  const [perfPage, setPerfPage] = useState(1)
  const [perfLimit, setPerfLimit] = useState(20)
  const [sortOrder] = useState<"asc" | "desc">("asc")

  // Salary configuration table state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  // Fetch performance rules with pagination
  const {
    data: performanceData,
    refetch: refetchPerformance,
    isLoading: isLoadingPerformance
  } = useQuery({
    queryKey: ["searchLivestreamPerformance", perfPage, perfLimit, sortOrder],
    queryFn: () =>
      searchLivestreamPerformance({
        page: perfPage,
        limit: perfLimit,
        sortOrder
      }),
    select: (data) => data.data
  })

  // Fetch users
  const { data: usersData } = useQuery({
    queryKey: ["publicSearchUser"],
    queryFn: () =>
      publicSearchUser({ page: 1, limit: 1000, role: "livestream-emp" }),
    select: (data) => data.data.data
  })

  // Fetch all performances for dropdown
  const { data: performancesData } = useQuery({
    queryKey: ["searchLivestreamPerformance"],
    queryFn: () =>
      searchLivestreamPerformance({
        page: 1,
        limit: 1000,
        sortOrder: "asc"
      }),
    select: (data) => data.data.data
  })

  // Fetch salary configurations
  const {
    data: salaryData,
    refetch,
    isLoading
  } = useQuery({
    queryKey: ["searchLivestreamSalary", page, limit],
    queryFn: () =>
      searchLivestreamSalary({
        page,
        limit
      }),
    select: (data) => data.data
  })

  const { mutate: deleteSalary } = useMutation({
    mutationFn: deleteLivestreamSalary,
    onSuccess: () => {
      CToast.success({ title: "Xóa cấu trúc lương thành công" })
      refetch()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xóa cấu trúc lương" })
    }
  })

  const { mutate: deletePerformance } = useMutation({
    mutationFn: deleteLivestreamPerformance,
    onSuccess: () => {
      CToast.success({ title: "Xóa bậc lương thành công" })
      refetchPerformance()
    },
    onError: () => {
      CToast.error({ title: "Có lỗi xảy ra khi xóa bậc lương" })
    }
  })

  const openPerformanceModal = (performance?: PerformanceRule) => {
    modals.open({
      title: (
        <b>{performance ? "Chỉnh sửa bậc lương" : "Thêm bậc lương mới"}</b>
      ),
      children: (
        <PerformanceModal
          performance={performance}
          refetch={refetchPerformance}
        />
      ),
      size: "lg"
    })
  }

  const confirmDeletePerformance = (performance: PerformanceRule) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa bậc lương từ{" "}
          <strong>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND"
            }).format(performance.minIncome)}
          </strong>{" "}
          đến{" "}
          <strong>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND"
            }).format(performance.maxIncome)}
          </strong>
          ?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deletePerformance({ id: performance._id })
    })
  }

  const openSalaryModal = (salary?: SalaryRule) => {
    modals.open({
      title: (
        <b>{salary ? "Chỉnh sửa cấu trúc lương" : "Thêm cấu trúc lương mới"}</b>
      ),
      children: (
        <SalaryModal
          salary={salary}
          refetch={refetch}
          users={usersData || []}
          performances={performancesData || []}
        />
      ),
      size: "lg"
    })
  }

  const confirmDeleteSalary = (salary: SalaryRule) => {
    modals.openConfirmModal({
      title: "Xác nhận xóa",
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa cấu trúc lương{" "}
          <strong>{salary.name}</strong>?
        </Text>
      ),
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteSalary({ id: salary._id })
    })
  }

  const salaries = (salaryData?.data || []) as SalaryRule[]
  const totalSalaries = salaryData?.total || 0

  const performances = performanceData?.data || []
  const totalPerformances = performanceData?.total || 0

  const performanceColumns = useMemo<ColumnDef<PerformanceRule>[]>(
    () => [
      {
        accessorKey: "minIncome",
        header: "Doanh thu tối thiểu",
        cell: ({ row }) => (
          <Text fw={500}>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND"
            }).format(row.original.minIncome)}
          </Text>
        )
      },
      {
        accessorKey: "maxIncome",
        header: "Doanh thu tối đa",
        cell: ({ row }) => (
          <Text fw={500}>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND"
            }).format(row.original.maxIncome)}
          </Text>
        )
      },
      {
        accessorKey: "salaryPerHour",
        header: "Lương/giờ",
        cell: ({ row }) => (
          <Text fw={600} c="indigo">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND"
            }).format(row.original.salaryPerHour)}
          </Text>
        )
      },
      {
        accessorKey: "bonusPercentage",
        header: "% Thưởng",
        cell: ({ row }) => (
          <Text fw={600} c="teal">
            {row.original.bonusPercentage}%
          </Text>
        )
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <Group gap="xs">
            <Can roles={["admin", "livestream-leader"]}>
              <ActionIcon
                variant="light"
                color="indigo"
                size="sm"
                onClick={() => openPerformanceModal(row.original)}
              >
                <IconEdit size={16} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color="red"
                size="sm"
                onClick={() => confirmDeletePerformance(row.original)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Can>
          </Group>
        )
      }
    ],
    [openPerformanceModal, confirmDeletePerformance]
  )

  const salaryColumns = useMemo<ColumnDef<SalaryRule>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Tên cấu trúc",
        cell: ({ row }) => <Text fw={600}>{row.original.name}</Text>
      },
      {
        id: "employees",
        header: "Nhân viên",
        cell: ({ row }) => (
          <Text fz="sm">
            {row.original.livestreamEmployees?.map((e) => e.name).join(", ") ||
              "-"}
          </Text>
        )
      },
      {
        id: "performances",
        header: "Bậc lương áp dụng",
        cell: ({ row }) => {
          const perfList = row.original.livestreamPerformances || []
          if (perfList.length === 0) return <Text fz="sm">-</Text>

          return (
            <Stack gap={4}>
              {perfList.map((perf, idx) => (
                <Text key={idx} fz="sm" c="dimmed">
                  {new Intl.NumberFormat("vi-VN").format(perf.minIncome)} -{" "}
                  {new Intl.NumberFormat("vi-VN").format(perf.maxIncome)} VNĐ (
                  {new Intl.NumberFormat("vi-VN").format(perf.salaryPerHour)}
                  đ/h, {perf.bonusPercentage}%)
                </Text>
              ))}
            </Stack>
          )
        }
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <Group gap="xs">
            <Can roles={["admin", "livestream-leader"]}>
              <ActionIcon
                variant="light"
                color="indigo"
                size="sm"
                onClick={() => openSalaryModal(row.original)}
              >
                <IconEdit size={16} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color="red"
                size="sm"
                onClick={() => confirmDeleteSalary(row.original)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Can>
          </Group>
        )
      }
    ],
    []
  )

  return (
    <LivestreamLayout>
      <Can roles={["admin", "livestream-leader"]}>
        {/* Performance Rules Section */}
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
          {/* Header Section */}
          <Flex
            align="flex-start"
            justify="space-between"
            pt={32}
            pb={16}
            px={{ base: 8, md: 28 }}
            direction="row"
            gap={8}
          >
            <Box>
              <Text fw={700} fz="xl" mb={2}>
                Bậc lương Livestream
              </Text>
              <Text c="dimmed" fz="sm">
                Quản lý các bậc lương dựa trên doanh thu
              </Text>
            </Box>

            <Group>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => openPerformanceModal()}
                size="md"
                radius="xl"
              >
                Thêm bậc lương
              </Button>
            </Group>
          </Flex>

          <Divider my={0} />

          {/* Content */}
          <Box px={{ base: 4, md: 28 }} py={20}>
            <CDataTable
              columns={performanceColumns}
              data={performances}
              isLoading={isLoadingPerformance}
              page={perfPage}
              totalPages={Math.ceil(totalPerformances / perfLimit)}
              onPageChange={setPerfPage}
              onPageSizeChange={setPerfLimit}
              initialPageSize={perfLimit}
              hideSearch
              getRowId={(row) => row._id}
            />

            {/* Summary */}
            {performances.length > 0 && (
              <Flex justify="space-between" align="center" mt={16}>
                <Text c="dimmed" fz="sm">
                  Hiển thị {performances.length} / {totalPerformances} bậc lương
                </Text>
              </Flex>
            )}
          </Box>
        </Box>
      </Can>

      {/* Salary Configuration Section */}
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
        {/* Header Section */}
        <Flex
          align="flex-start"
          justify="space-between"
          pt={32}
          pb={16}
          px={{ base: 8, md: 28 }}
          direction="row"
          gap={8}
        >
          <Box>
            <Text fw={700} fz="xl" mb={2}>
              Cấu trúc lương Livestream
            </Text>
            <Text c="dimmed" fz="sm">
              Quản lý cấu trúc lương cho từng nhân viên
            </Text>
          </Box>

          <Can roles={["admin", "livestream-leader"]}>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => openSalaryModal()}
              size="md"
              radius="xl"
            >
              Thêm cấu trúc
            </Button>
          </Can>
        </Flex>

        <Divider my={0} />

        {/* Content */}
        <Box px={{ base: 4, md: 28 }} py={20}>
          <CDataTable
            columns={salaryColumns}
            data={salaries}
            isLoading={isLoading}
            page={page}
            totalPages={Math.ceil(totalSalaries / limit)}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            initialPageSize={limit}
            hideSearch
            getRowId={(row) => row._id}
          />

          {/* Summary */}
          {salaries.length > 0 && (
            <Flex justify="space-between" align="center" mt={16}>
              <Text c="dimmed" fz="sm">
                Hiển thị {salaries.length} / {totalSalaries} cấu trúc lương
              </Text>
            </Flex>
          )}
        </Box>
      </Box>
    </LivestreamLayout>
  )
}
