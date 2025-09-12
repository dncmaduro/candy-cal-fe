import { useQueries } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import { Badge, Stack } from "@mantine/core"
import { useMemo } from "react"

interface Props {
  items: {
    _id: string
    quantity: number
  }[]
}

export const ShopeeProductItems = ({ items }: Props) => {
  const { getStorageItem } = useItems()

  const queries = items.map((item) => ({
    queryKey: ["getStorageItem", item._id],
    queryFn: () => getStorageItem(item._id)
  }))

  const itemsData = useQueries({
    queries,
    combine: (response) => {
      return {
        data: response.map((result) => result.data),
        pending: response.some((result) => result.isPending)
      }
    }
  })

  const convertedItems = useMemo(() => {
    return itemsData.data.map((item) => {
      return {
        ...item?.data,
        quantity: items.find((it) => it._id === item?.data._id)?.quantity
      }
    })
  }, [itemsData, items])

  return (
    <Stack gap={4}>
      {convertedItems.map((item) => (
        <Badge
          key={item._id}
          className="!normal-case"
          variant="light"
          color="orange"
        >
          {item.name} ({item.quantity})
        </Badge>
      ))}
    </Stack>
  )
}
