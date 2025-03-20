import { callApi } from "./axios"
import { CreateProductRequest, ProductResponse } from "./models"

export const useProducts = () => {
  const createProduct = async (item: CreateProductRequest) => {
    return callApi<CreateProductRequest, ProductResponse[]>({
      path: `/v1/products`,
      method: "POST",
      data: item
    })
  }

  const updateProduct = async (item: ProductResponse) => {
    return callApi<ProductResponse, ProductResponse>({
      path: `/v1/products`,
      method: "PUT",
      data: item
    })
  }

  const getProduct = async (id: string) => {
    return callApi<never, ProductResponse>({
      path: `/v1/products/product?id=${id}`,
      method: "GET"
    })
  }

  const searchProducts = async (searchText: string) => {
    return callApi<never, ProductResponse[]>({
      path: `/v1/products/search?searchText=${searchText}`,
      method: "GET"
    })
  }

  return { createProduct, updateProduct, searchProducts, getProduct }
}
