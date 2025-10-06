import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import { Badge, Loader, Stack } from "@mantine/core"

interface Props {
  items: {
    _id: string
    quantity: number
  }[]
}

export const ProductItemsV2 = ({ items }: Props) => {
  const { searchStorageItems } = useItems()

  const { data: storageItemsData, isLoading } = useQuery({
    queryKey: ["searchStorageItems"],
    queryFn: () => searchStorageItems({ searchText: "", deleted: false }),
    select: (data) => data.data
  })

  if (isLoading) return <Loader size="xs" />

  return (
    <Stack gap={4}>
      {items.map(({ _id, quantity }) => {
        const item = storageItemsData?.find((it) => it._id === _id)
        if (!item) return null
        return (
          <Badge key={_id} color="blue" variant="light">
            {item.name} - SL: {quantity}
          </Badge>
        )
      })}
    </Stack>
  )
}
