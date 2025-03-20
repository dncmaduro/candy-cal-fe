import { useQueries } from "@tanstack/react-query"
import { useProducts } from "../../hooks/useProducts"
import { useMemo } from "react"
import { Badge, Stack } from "@mantine/core"

interface Props {
  products: {
    _id: string
    quantity: number
  }[]
}

export const ComboProducts = ({ products }: Props) => {
  const { getProduct } = useProducts()

  const queries = products.map((product) => ({
    queryKey: ["getItem", product._id],
    queryFn: () => getProduct(product._id)
  }))

  const productsData = useQueries({
    queries,
    combine: (response) => {
      return {
        data: response.map((result) => result.data),
        pending: response.some((result) => result.isPending)
      }
    }
  })

  const convertedProducts = useMemo(() => {
    return productsData.data.map((product) => {
      return {
        ...product?.data,
        quantity: products.find((pr) => pr._id === product?.data._id)?.quantity
      }
    })
  }, [productsData, products])

  return (
    <Stack gap={4}>
      {convertedProducts.map((product) => (
        <Badge key={product._id} className="!normal-case">
          {product.name} ({product.quantity})
        </Badge>
      ))}
    </Stack>
  )
}
