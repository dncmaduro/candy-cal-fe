import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import {
  Box,
  Button,
  Divider,
  Flex,
  Text,
  TextInput,
  Tooltip,
  rem,
  Group,
  Select,
  Pagination,
  Checkbox
} from "@mantine/core"
import { modals } from "@mantine/modals"
import { useEffect, useState } from "react"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { useDebouncedValue } from "@mantine/hooks"
import { StorageItemModal } from "./StorageItemModal"
import { MonthPickerInput } from "@mantine/dates"
import { format } from "date-fns"
import { MonthLogsModal } from "./MonthLogsModal"
import { Can } from "../common/Can"
import { StorageItemsTable } from "./StorageItemsTable"

type ShowMode = "both" | "quantity" | "real"

const MODE_OPTIONS = [
  { value: "both", label: "Hiển thị cả Số lượng & Thực tế" },
  { value: "quantity", label: "Chỉ Số lượng" },
  { value: "real", label: "Chỉ Thực tế" }
]

interface Props {
  readOnly?: boolean
  activeTab: string
}

export const StorageItems = ({ readOnly, activeTab }: Props) => {
  const { searchStorageItems } = useItems()
  const [searchText, setSearchText] = useState<string>("")
  const [debouncedSearchText] = useDebouncedValue(searchText, 300)
  const [showMode, setShowMode] = useState<ShowMode>("both")
  const [month, setMonth] = useState<Date | null>(new Date())
  const [page, setPage] = useState(1)
  const [showDeleted, setShowDeleted] = useState(false)
  const limit = 10

  const { data, refetch, isLoading } = useQuery({
    queryKey: [
      "searchStorageItems",
      debouncedSearchText,
      activeTab,
      showDeleted
    ],
    queryFn: () =>
      searchStorageItems({
        searchText: debouncedSearchText,
        deleted: showDeleted
      })
  })

  // Client-side pagination
  const allItemsData = data?.data || []
  const totalPages = Math.ceil(allItemsData.length / limit)
  const itemsData = allItemsData.slice((page - 1) * limit, page * limit)

  useEffect(() => {
    refetch()
  }, [debouncedSearchText])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchText, showDeleted])

  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      maw={1600}
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
            {showDeleted ? "Các mặt hàng đã xóa" : "Các mặt hàng đang có"}
          </Text>
          <Text c="dimmed" fz="sm">
            {showDeleted
              ? "Xem và khôi phục các mặt hàng đã bị xóa"
              : "Quản lý và chỉnh sửa danh sách mặt hàng"}
          </Text>
        </Box>
        <Flex gap={12} align="center" w={{ base: "100%", sm: "auto" }}>
          <TextInput
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            leftSection={<IconSearch size={16} />}
            placeholder="Tìm kiếm mặt hàng..."
            size="md"
            w={{ base: "100%", sm: 240 }}
            radius="md"
            styles={{
              input: { background: "#f4f6fb", border: "1px solid #ececec" }
            }}
          />
          {!showDeleted && (
            <Tooltip label="Thêm mặt hàng mới" withArrow>
              <Can roles={["admin", "accounting-emp"]}>
                <Button
                  color="indigo"
                  leftSection={<IconPlus size={18} />}
                  radius="xl"
                  hidden={readOnly}
                  size="md"
                  px={18}
                  onClick={() =>
                    modals.open({
                      size: "lg",
                      title: (
                        <Text fw={700} fz="md">
                          Thêm sản phẩm mới
                        </Text>
                      ),
                      children: <StorageItemModal refetch={refetch} />
                    })
                  }
                  style={{
                    fontWeight: 600,
                    letterSpacing: 0.1
                  }}
                >
                  Thêm mặt hàng
                </Button>
              </Can>
            </Tooltip>
          )}
        </Flex>
      </Flex>

      <Divider my={0} />

      <Group
        px={{ base: 4, md: 28 }}
        py={14}
        justify="space-between"
        align="flex-end"
        h={100}
        style={{ minHeight: 80 }}
      >
        <Box
          p={12}
          style={{
            backgroundColor: showDeleted
              ? "rgba(255, 0, 0, 0.1)"
              : "rgba(0, 128, 0, 0.1)",
            borderRadius: rem(8),
            border: `1px solid ${showDeleted ? "rgba(255, 0, 0, 0.2)" : "rgba(0, 128, 0, 0.2)"}`,
            transition: "all 0.2s ease"
          }}
        >
          <Checkbox
            label={
              showDeleted
                ? "Hiển thị mặt hàng đã xóa"
                : "Hiển thị mặt hàng hoạt động"
            }
            checked={showDeleted}
            onChange={(event) => setShowDeleted(event.currentTarget.checked)}
            color={showDeleted ? "red" : "green"}
            size="md"
            styles={{
              label: {
                fontWeight: 500,
                color: showDeleted ? "#dc2626" : "#16a34a"
              }
            }}
          />
        </Box>

        <Group align="flex-end" miw={500}>
          {!showDeleted ? (
            <>
              <Select
                data={MODE_OPTIONS}
                value={showMode}
                onChange={(val) => setShowMode(val as ShowMode)}
                w={250}
                radius="md"
                label="Kiểu hiển thị"
              />
              <Divider mx={8} orientation="vertical" />
              <MonthPickerInput
                label="Xem số liệu theo tháng"
                value={month}
                onChange={setMonth}
                valueFormat="MM/YYYY"
              />
              <Button
                variant="outline"
                onClick={() =>
                  modals.open({
                    size: "lg",
                    title: (
                      <b>Số liệu theo tháng {format(month!, "MM/yyyy")}</b>
                    ),
                    children: <MonthLogsModal month={month} />
                  })
                }
              >
                Xem
              </Button>
            </>
          ) : (
            <Box w={500} />
          )}
        </Group>
      </Group>

      <Box px={{ base: 4, md: 28 }} py={20}>
        <StorageItemsTable
          itemsData={itemsData}
          isLoading={isLoading}
          showMode={showMode}
          showDeleted={showDeleted}
          readOnly={readOnly}
          refetch={refetch}
        />

        <Flex justify="space-between" mt={8} align={"center"}>
          <Text c="dimmed" mr={8}>
            Tổng số mặt hàng: {allItemsData.length}
          </Text>
          <Pagination total={totalPages} value={page} onChange={setPage} />
          <Text c="dimmed" ml={8}>
            Hiển thị {Math.min(limit, allItemsData.length)} /{" "}
            {allItemsData.length}
          </Text>
        </Flex>
      </Box>
    </Box>
  )
}
