import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import {
  CalItemsRequest,
  CalItemsResponse,
  CreateProductRequest,
  ProductResponse,
  SearchProductsRequest
} from "./models"
import { toQueryString } from "../utils/toQuery"

export const useProducts = () => {
  const { accessToken } = useUserStore()

  const createProduct = async (item: CreateProductRequest) => {
    return callApi<CreateProductRequest, ProductResponse[]>({
      path: `/v1/products`,
      method: "POST",
      data: item,
      token: accessToken
    })
  }

  const updateProduct = async (item: ProductResponse) => {
    return callApi<ProductResponse, ProductResponse>({
      path: `/v1/products`,
      method: "PUT",
      data: item,
      token: accessToken
    })
  }

  const getProduct = async (id: string) => {
    return callApi<never, ProductResponse>({
      path: `/v1/products/product?id=${id}`,
      method: "GET",
      token: accessToken
    })
  }

  const searchProducts = async (req: SearchProductsRequest) => {
    const query = toQueryString(req)

    return callApi<never, ProductResponse[]>({
      path: `/v1/products/search?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const deleteProduct = async (id: string) => {
    return callApi<never, never>({
      path: `/v1/products/${id}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const restoreProduct = async (req: { id: string }) => {
    return callApi<{ id: string }, never>({
      path: `/v1/products/${req.id}/restore`,
      method: "PATCH",
      token: accessToken
    })
  }

  const getAllProducts = async () => {
    return callApi<never, ProductResponse[]>({
      path: `/v1/products`,
      method: "GET",
      token: accessToken
    })
  }

  const calProducts = async (req: CalItemsRequest) => {
    return callApi<CalItemsRequest, CalItemsResponse[]>({
      path: `/v1/products/cal`,
      data: req,
      method: "POST",
      token: accessToken
    })
  }

  const calFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return callApi<FormData, CalItemsResponse>({
      path: `/v1/products/cal-xlsx`,
      data: formData,
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      token: accessToken
    })
  }

  return {
    createProduct,
    updateProduct,
    searchProducts,
    getProduct,
    getAllProducts,
    calProducts,
    calFile,
    deleteProduct,
    restoreProduct
  }
}
