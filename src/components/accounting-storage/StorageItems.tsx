import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebouncedValue } from "@mantine/hooks"
import {
  Box,
  Button,
  Divider,
  Group,
  Paper,
  Select,
  Switch,
  Text,
  TextInput
} from "@mantine/core"
import { modals } from "@mantine/modals"
import { IconPlus, IconRefresh, IconSearch } from "@tabler/icons-react"

import { useItems } from "../../hooks/useItems"
import { Can } from "../common/Can"
import { StorageItemModal } from "./StorageItemModal"
import { StorageItemsTable } from "./StorageItemsTable"

type ShowMode = "both" | "quantity" | "real"

const MODE_OPTIONS = [
  { value: "quantity", label: "Số lượng" },
  { value: "real", label: "Thực tế" },
  { value: "both", label: "Số lượng & Thực tế" }
]

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
      <Group gap={12} wrap="wrap" align="end">
        <TextInput
          value={searchText}
          onChange={(e) => setSearchText(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          placeholder="Tìm kiếm theo tên hoặc mã mặt hàng"
          w={{ base: "100%", sm: 320 }}
        />

        <Switch
          label="Bao gồm mặt hàng đã xóa"
          checked={showDeleted}
          onChange={(e) => setShowDeleted(e.currentTarget.checked)}
          color="indigo"
        />

        <Select
          label="Đơn vị hiển thị"
          data={MODE_OPTIONS}
          value={showMode}
          onChange={(val) => setShowMode((val as ShowMode) ?? "quantity")}
          w={{ base: "100%", sm: 220 }}
          allowDeselect={false}
        />
      </Group>
    )
  }, [searchText, showDeleted, showMode])

  const extraActions = useMemo(() => {
    return (
      <Group gap={10} wrap="wrap">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconRefresh size={16} />}
          onClick={() => refetch()}
        >
          Làm mới
        </Button>

        <Can roles={["admin", "accounting-emp"]}>
          <Button
            color="indigo"
            leftSection={<IconPlus size={18} />}
            radius="md"
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
      </Group>
    )
  }, [readOnly, refetch])

  return (
    <Paper
      mt={30}
      mx="auto"
      px={{ base: 8, md: 0 }}
      py={0}
      w="100%"
      maw={1640}
      radius="lg"
      style={{
        background: "rgba(255,255,255,0.97)",
        boxShadow: "0 4px 24px 0 rgba(50, 64, 117, 0.06)",
        border: "1px solid #ececec"
      }}
    >
      {/* Header */}
      <Group
        justify="space-between"
        align="center"
        pt={24}
        pb={12}
        px={{ base: 12, md: 28 }}
        wrap="wrap"
      >
        <Box>
          <Text fw={800} fz="xl" mb={4}>
            Danh sách mặt hàng tồn kho
          </Text>
          <Text c="dimmed" fz="sm">
            Theo dõi nhập, xuất và tồn kho theo từng mặt hàng
          </Text>
        </Box>

        <Text c="gray.7" fz="md" fw={700} style={{ fontVariantNumeric: "tabular-nums" }}>
          {(data ?? []).length.toLocaleString("vi-VN")} mặt hàng
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
    </Paper>
  )
}
