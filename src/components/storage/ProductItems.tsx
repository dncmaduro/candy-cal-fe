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

export const ProductItems = ({ items }: Props) => {
  const { getItem } = useItems()

  const queries = items.map((item) => ({
    queryKey: ["getItem", item._id],
    queryFn: () => getItem(item._id)
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
        <Badge key={item._id} className="!normal-case">
          {item.name} ({item.quantity})
        </Badge>
      ))}
    </Stack>
  )
}
