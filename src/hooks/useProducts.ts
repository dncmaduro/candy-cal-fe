import { callApi } from "./axios"
import {
  CalItemsRequest,
  CalItemsResponse,
  CreateProductRequest,
  ProductResponse
} from "./models"

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

  const getAllProducts = async () => {
    return callApi<never, ProductResponse[]>({
      path: `/v1/products`,
      method: "GET"
    })
  }

  const calProducts = async (req: CalItemsRequest) => {
    return callApi<CalItemsRequest, CalItemsResponse[]>({
      path: `/v1/products/cal`,
      data: req,
      method: "POST"
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
      }
    })
  }

  return {
    createProduct,
    updateProduct,
    searchProducts,
    getProduct,
    getAllProducts,
    calProducts,
    calFile
  }
}
