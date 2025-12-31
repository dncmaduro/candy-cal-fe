import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebouncedValue } from "@mantine/hooks"
import {
  Box,
  Button,
  Divider,
  Group,
  Select,
  Switch,
  Text,
  TextInput,
  rem
} from "@mantine/core"
import { modals } from "@mantine/modals"
import { IconPlus, IconSearch } from "@tabler/icons-react"

import { useItems } from "../../hooks/useItems"
import { Can } from "../common/Can"
import { StorageItemModal } from "./StorageItemModal"
import { MonthLogsModal } from "./MonthLogsModal"
import { StorageItemsTable } from "./StorageItemsTable"

type ShowMode = "both" | "quantity" | "real"

const MODE_OPTIONS = [
  { value: "quantity", label: "Chỉ Số lượng" },
  { value: "real", label: "Chỉ Thực tế" },
  { value: "both", label: "Cả Số lượng & Thực tế" }
] as const

interface Props {
  readOnly?: boolean
  activeTab: string
}

export const StorageItems = ({ readOnly, activeTab }: Props) => {
  const { searchStorageItems } = useItems()

  const [searchText, setSearchText] = useState("")
  const [debouncedSearchText] = useDebouncedValue(searchText, 300)

  const [showMode, setShowMode] = useState<ShowMode>("quantity")
  const [showDeleted, setShowDeleted] = useState(false)

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
      }),
    select: (res) => res.data ?? []
  })

  useEffect(() => {
    refetch()
  }, [debouncedSearchText, showDeleted, refetch])

  const extraFilters = useMemo(() => {
    return (
      <Group gap={10} wrap="wrap" align="end">
        <TextInput
          value={searchText}
          onChange={(e) => setSearchText(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          placeholder="Tìm kiếm mặt hàng..."
          w={260}
        />

        <Switch
          label="Hiển thị đã xoá"
          checked={showDeleted}
          onChange={(e) => setShowDeleted(e.currentTarget.checked)}
          color="red"
        />

        {!showDeleted && (
          <Select
            label="Kiểu hiển thị"
            data={MODE_OPTIONS as any}
            value={showMode}
            onChange={(val) => setShowMode((val as ShowMode) ?? "quantity")}
            w={220}
            allowDeselect={false}
          />
        )}
      </Group>
    )
  }, [searchText, showDeleted, showMode])

  const extraActions = useMemo(() => {
    return (
      <Group gap={10} wrap="wrap">
        {!showDeleted && (
          <>
            <Button
              variant="outline"
              onClick={() =>
                modals.open({
                  size: "1100",
                  title: <b>Số liệu theo tháng</b>,
                  children: <MonthLogsModal initialMonth={new Date()} />
                })
              }
            >
              Xem theo tháng
            </Button>

            <Can roles={["admin", "accounting-emp"]}>
              <Button
                color="indigo"
                leftSection={<IconPlus size={18} />}
                radius="xl"
                hidden={readOnly}
                onClick={() =>
                  modals.open({
                    size: "lg",
                    title: (
                      <Text fw={700} fz="md">
                        Thêm mặt hàng mới
                      </Text>
                    ),
                    children: <StorageItemModal refetch={refetch} />
                  })
                }
              >
                Thêm mặt hàng
              </Button>
            </Can>
          </>
        )}
      </Group>
    )
  }, [showDeleted, readOnly, refetch])

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
      {/* Header */}
      <Group
        justify="space-between"
        align="center"
        pt={26}
        pb={10}
        px={{ base: 8, md: 28 }}
        wrap="wrap"
      >
        <Box>
          <Text fw={700} fz="xl" mb={2}>
            {showDeleted ? "Các mặt hàng đã xoá" : "Các mặt hàng đang có"}
          </Text>
          <Text c="dimmed" fz="sm">
            {showDeleted
              ? "Tra cứu và chỉnh sửa thông tin mặt hàng đã xoá"
              : "Quản lý, theo dõi nhập/xuất/tồn kho theo mặt hàng"}
          </Text>
        </Box>

        <Text c="dimmed" fz="sm">
          Tổng: <b>{(data ?? []).length}</b>
        </Text>
      </Group>

      <Divider my={0} />

      {/* Table */}
      <Box px={{ base: 4, md: 28 }} py={18}>
        <StorageItemsTable
          itemsData={data ?? []}
          isLoading={isLoading}
          showMode={showMode}
          showDeleted={showDeleted}
          readOnly={readOnly}
          refetch={refetch}
          extraFilters={extraFilters}
          extraActions={extraActions}
        />
      </Box>
    </Box>
  )
}
