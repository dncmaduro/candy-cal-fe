import { createFileRoute } from "@tanstack/react-router"
import { useProducts } from "../../hooks/useProducts"
import { useMutation } from "@tanstack/react-query"
import { modals } from "@mantine/modals"
import { CalResultModal } from "../../components/cal/CalResultModal"
import { Button, Flex, Text } from "@mantine/core"
import { useFileDialog } from "@mantine/hooks"
import { useState } from "react"
import { AppLayout } from "../../components/layouts/AppLayout"

export const Route = createFileRoute("/calfile/")({
  component: RouteComponent
})

function RouteComponent() {
  const { calFile } = useProducts()

  const { mutate: calc, isPending } = useMutation({
    mutationKey: ["calFile"],
    mutationFn: calFile,
    onSuccess: (response) => {
      modals.open({
        title: "Tổng sản phẩm",
        children: (
          <CalResultModal
            items={response.data.items}
            orders={response.data.orders}
          />
        )
      })
    }
  })

  const [file, setFile] = useState<File | null>(null)

  const fileDialog = useFileDialog({
    accept: ".xlsx",
    multiple: false,
    onChange: (files) => setFile(files ? files[0] : null)
  })

  return (
    <AppLayout>
      <Flex gap={32} align="center" direction={"column"} mx={"auto"} mt={32}>
        <Button onClick={fileDialog.open} color="green" w={"fit-content"}>
          Chọn file .xlsx để tính toán
        </Button>
        <Text>{file?.name}</Text>
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
      </Flex>
    </AppLayout>
  )
}
