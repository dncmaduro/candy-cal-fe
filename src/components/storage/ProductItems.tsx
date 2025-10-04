import { useQuery } from "@tanstack/react-query"
import { useItems } from "../../hooks/useItems"
import { Badge, Loader, Stack } from "@mantine/core"
import { useMemo } from "react"

interface Props {
  items: {
    _id: string
    quantity: number
  }[]
}

export const ProductItems = ({ items }: Props) => {
  const { searchStorageItems } = useItems()

  const { data: storageItemsData, isLoading } = useQuery({
    queryKey: ["searchStorageItems"],
    queryFn: () => searchStorageItems({ searchText: "", deleted: false }),
    select: (data) => data.data
  })

  const ids = useMemo(
    () => (storageItemsData || []).map((item) => item._id),
    [items]
  )

  if (isLoading) return <Loader size="xs" />

  return (
    <Stack gap={4}>
      {items.map(({ _id, quantity }) => {
        const item = storageItemsData?.find((item) => item._id === _id)
        return (
          ids.includes(_id) && (
            <Badge key={_id} color="blue" variant="light">
              {item?.name} - SL: {quantity}
            </Badge>
          )
        )
      })}
    </Stack>
  )
}
