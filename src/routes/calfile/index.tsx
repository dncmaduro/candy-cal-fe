import { createFileRoute } from "@tanstack/react-router"
import { useProducts } from "../../hooks/useProducts"
import { useMutation } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { CalResultModal } from "../../components/cal/CalResultModal"
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  Title,
  rem
} from "@mantine/core"
import { useFileDialog } from "@mantine/hooks"
import { useState } from "react"
import { AppLayout } from "../../components/layouts/AppLayout"
import { Helmet } from "react-helmet-async"
import { IconUpload, IconCalculator, IconHistory } from "@tabler/icons-react"
import { useAuthGuard } from "../../hooks/useAuthGuard"

export const Route = createFileRoute("/calfile/")({
  component: RouteComponent
})

interface ItemType {
  _id: string
  quantity: number
  storageItems: {
    code: string
    name: string
    receivedQuantity: {
      quantity: number
      real: number
    }
    deliveredQuantity: {
      quantity: number
      real: number
    }
    restQuantity: {
      quantity: number
      real: number
    }
    note?: string
    _id: string
  }[]
}

function RouteComponent() {
  useAuthGuard(["admin", "order-emp"])
  const { calFile } = useProducts()
  const [items, setItems] = useState<ItemType[]>([])
  const [orders, setOrders] = useState<
    {
      products: { name: string; quantity: number }[]
      quantity: number
    }[]
  >([])
  const [file, setFile] = useState<File | null>(null)
  const [latestFileName, setLatestFileName] = useState<string | undefined>()

  const { mutate: calc, isPending } = useMutation({
    mutationKey: ["calFile"],
    mutationFn: calFile,
    onSuccess: (response) => {
      setItems(response.data.items)
      setOrders(response.data.orders)
      setLatestFileName(file?.name)
      modals.open({
        title: `Tổng sản phẩm trong File ${file?.name}`,
        children: (
          <CalResultModal
            items={response.data.items}
            orders={response.data.orders}
          />
        ),
        size: "xl",
        w: 1400
      })
    }
  })

  const fileDialog = useFileDialog({
    accept: ".xlsx, .xls",
    multiple: false,
    onChange: (files) => setFile(files ? files[0] : null)
  })

  return (
    <>
      <Helmet>
        <title>MyCandy x Chíp</title>
      </Helmet>
      <AppLayout>
        <Container size="sm" pt={48} pb={56}>
          <Stack gap={36} align="center">
            <Title order={2} fz={{ base: 22, md: 26 }}>
              Tính toán từ file Excel
            </Title>

            <Button
              onClick={fileDialog.open}
              color="green"
              leftSection={<IconUpload size={18} />}
              size="md"
              radius="xl"
              px={22}
              fw={600}
              style={{ letterSpacing: 0.1 }}
            >
              Chọn file .xlsx để tính toán
            </Button>

            {file && (
              <Box
                px={22}
                py={14}
                mt={-8}
                mb={-8}
                style={{
                  background: "#f4f6fb",
                  borderRadius: rem(14),
                  border: "1px solid #e5e7ef",
                  display: "inline-block"
                }}
              >
                <Text size="sm" c="dimmed">
                  Đã chọn: <b>{file.name}</b>
                </Text>
              </Box>
            )}

            <Divider w={120} />

            <Group gap={14}>
              <Button
                loading={isPending}
                disabled={!file}
                onClick={() => file && calc(file)}
                leftSection={<IconCalculator size={18} />}
                color="indigo"
                fw={600}
                size="md"
                radius="xl"
                px={20}
              >
                Bắt đầu tính
              </Button>

              <Button
                disabled={!latestFileName}
                variant="light"
                color="yellow"
                leftSection={<IconHistory size={18} />}
                size="md"
                radius="xl"
                px={20}
                fw={600}
                onClick={() =>
                  modals.open({
                    title: `Tổng sản phẩm trong File ${latestFileName}`,
                    children: <CalResultModal items={items} orders={orders} />,
                    size: "xl",
                    w: 1400
                  })
                }
              >
                Xem lại kết quả
              </Button>
            </Group>
          </Stack>
        </Container>
      </AppLayout>
    </>
  )
}
