import { useState, useMemo } from "react"
import {
  Grid,
  Card,
  Group,
  Text,
  Alert,
  Skeleton,
  ScrollArea,
  Table,
  TextInput,
  Badge,
  rem
} from "@mantine/core"
import { IconSearch, IconAlertCircle } from "@tabler/icons-react"

interface ItemData {
  code: string
  name: string
  revenue?: number
  quantity?: number
}

interface ChannelData {
  channelId: string
  channelName: string
  revenue: number
  orderCount: number
}

interface UserData {
  userId: string
  userName: string
  revenue: number
  orderCount: number
}

interface RevenueTablesProps {
  isLoading: boolean
  items?: ItemData[]
  channels?: ChannelData[]
  users?: UserData[]
}

const cardStyle = {
  border: "1px solid #E5E7EB",
  borderRadius: rem(14),
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
  background: "#fff"
}

export function RevenueTables({
  isLoading,
  items = [],
  channels = [],
  users = []
}: RevenueTablesProps) {
  const [itemsFilter, setItemsFilter] = useState("")
  const [channelFilter, setChannelFilter] = useState("")
  const [userFilter, setUserFilter] = useState("")

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.code.toLowerCase().includes(itemsFilter.toLowerCase()) ||
        item.name.toLowerCase().includes(itemsFilter.toLowerCase())
    )
  }, [items, itemsFilter])

  const filteredChannels = useMemo(() => {
    return channels.filter((ch) =>
      ch.channelName.toLowerCase().includes(channelFilter.toLowerCase())
    )
  }, [channels, channelFilter])

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.userName.toLowerCase().includes(userFilter.toLowerCase())
    )
  }, [users, userFilter])

  return (
    <Grid gutter={14}>
      <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
        <Card padding="md" style={cardStyle}>
          <Group mb="sm" justify="space-between" wrap="wrap" gap={8}>
            <Text fw={600}>Sản phẩm bán chạy</Text>
            <TextInput
              placeholder="Tìm kiếm..."
              size="sm"
              h={40}
              radius="md"
              leftSection={<IconSearch size={14} />}
              value={itemsFilter}
              onChange={(e) => setItemsFilter(e.currentTarget.value)}
              miw={170}
            />
          </Group>

          <ScrollArea mah={360}>
            {isLoading ? (
              <Skeleton height={240} />
            ) : filteredItems.length > 0 ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Mã SP</Table.Th>
                    <Table.Th>Tên</Table.Th>
                    <Table.Th ta="right">SL</Table.Th>
                    <Table.Th ta="right">DT</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredItems.map((item, idx) => (
                    <Table.Tr key={idx}>
                      <Table.Td>
                        <Text fw={500} size="sm">
                          {item.code}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" lineClamp={1}>
                          {item.name}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Badge size="sm">{(item as any).quantity || (item as any).revenue}</Badge>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" fw={500}>
                          {((item as any).revenue || 0).toLocaleString("vi-VN")}đ
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Alert
                color="yellow"
                icon={<IconAlertCircle size={14} />}
                radius="md"
                p="sm"
                styles={{
                  root: { background: "#fff7e8", borderColor: "#fde7c2" },
                  message: { fontSize: 13 }
                }}
              >
                Không có dữ liệu
              </Alert>
            )}
          </ScrollArea>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
        <Card padding="md" style={cardStyle}>
          <Group mb="sm" justify="space-between" wrap="wrap" gap={8}>
            <Text fw={600}>Theo kênh</Text>
            <TextInput
              placeholder="Tìm kiếm..."
              size="sm"
              h={40}
              radius="md"
              leftSection={<IconSearch size={14} />}
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.currentTarget.value)}
              miw={170}
            />
          </Group>

          <ScrollArea mah={360}>
            {isLoading ? (
              <Skeleton height={240} />
            ) : filteredChannels.length > 0 ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Kênh</Table.Th>
                    <Table.Th ta="right">Đơn</Table.Th>
                    <Table.Th ta="right">DT</Table.Th>
                    <Table.Th ta="right">ARPU</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredChannels.map((ch, idx) => (
                    <Table.Tr key={idx}>
                      <Table.Td>
                        <Text fw={500} size="sm">
                          {ch.channelName}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Badge size="sm">{ch.orderCount}</Badge>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" fw={500}>
                          {ch.revenue.toLocaleString("vi-VN")}đ
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" c="dimmed">
                          {ch.orderCount > 0
                            ? (ch.revenue / ch.orderCount).toLocaleString("vi-VN")
                            : "0"}
                          đ
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Alert
                color="yellow"
                icon={<IconAlertCircle size={14} />}
                radius="md"
                p="sm"
                styles={{
                  root: { background: "#fff7e8", borderColor: "#fde7c2" },
                  message: { fontSize: 13 }
                }}
              >
                Không có dữ liệu
              </Alert>
            )}
          </ScrollArea>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
        <Card padding="md" style={cardStyle}>
          <Group mb="sm" justify="space-between" wrap="wrap" gap={8}>
            <Text fw={600}>Theo nhân viên</Text>
            <TextInput
              placeholder="Tìm kiếm..."
              size="sm"
              h={40}
              radius="md"
              leftSection={<IconSearch size={14} />}
              value={userFilter}
              onChange={(e) => setUserFilter(e.currentTarget.value)}
              miw={170}
            />
          </Group>

          <ScrollArea mah={360}>
            {isLoading ? (
              <Skeleton height={240} />
            ) : filteredUsers.length > 0 ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nhân viên</Table.Th>
                    <Table.Th ta="right">Đơn</Table.Th>
                    <Table.Th ta="right">DT</Table.Th>
                    <Table.Th ta="right">ARPU</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredUsers.map((u, idx) => (
                    <Table.Tr key={idx}>
                      <Table.Td>
                        <Text fw={500} size="sm">
                          {u.userName}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Badge size="sm">{u.orderCount}</Badge>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" fw={500}>
                          {u.revenue.toLocaleString("vi-VN")}đ
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" c="dimmed">
                          {u.orderCount > 0
                            ? (u.revenue / u.orderCount).toLocaleString("vi-VN")
                            : "0"}
                          đ
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Alert
                color="yellow"
                icon={<IconAlertCircle size={14} />}
                radius="md"
                p="sm"
                styles={{
                  root: { background: "#fff7e8", borderColor: "#fde7c2" },
                  message: { fontSize: 13 }
                }}
              >
                Không có dữ liệu
              </Alert>
            )}
          </ScrollArea>
        </Card>
      </Grid.Col>
    </Grid>
  )
}
