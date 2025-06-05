import { createFileRoute } from "@tanstack/react-router"
import { useProducts } from "../../hooks/useProducts"
import { useMutation } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { CalResultModal } from "../../components/cal/CalResultModal"
import { Button, Flex, Group, Text } from "@mantine/core"
import { useFileDialog } from "@mantine/hooks"
import { useState } from "react"
import { AppLayout } from "../../components/layouts/AppLayout"
import { Helmet } from "react-helmet-async"

export const Route = createFileRoute("/calfile/")({
  component: RouteComponent
})

function RouteComponent() {
  const { calFile } = useProducts()
  const [items, setItems] = useState<
    {
      _id: string
      quantity: number
    }[]
  >([])

  const [orders, setOrders] = useState<
    {
      products: {
        name: string
        quantity: number
      }[]
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
        <Flex gap={32} align="center" direction={"column"} mx={"auto"} mt={32}>
          <Button onClick={fileDialog.open} color="green" w={"fit-content"}>
            Chọn file .xlsx để tính toán
          </Button>
          <Text>{file?.name}</Text>
          <Group>
            <Button
              loading={isPending}
              disabled={!file}
              onClick={() => {
                if (file) {
                  calc(file)
                }
              }}
            >
              Bắt đầu tính
            </Button>
            <Button
              disabled={!latestFileName}
              variant="outline"
              color="yellow"
              onClick={() =>
                modals.open({
                  title: `Tổng sản phẩm trong File ${latestFileName}`,
                  children: <CalResultModal items={items} orders={orders} />,
                  size: "xl",
                  w: 1400
                })
              }
            >
              Xem lại kết quả của file trước đó
            </Button>
          </Group>
        </Flex>
      </AppLayout>
    </>
  )
}
