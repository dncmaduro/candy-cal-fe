import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import {
  CalItemsRequest,
  CalItemsResponse,
  CreateProductRequest,
  ProductResponse
} from "./models"

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

  const searchProducts = async (searchText: string) => {
    return callApi<never, ProductResponse[]>({
      path: `/v1/products/search?searchText=${searchText}`,
      method: "GET",
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
    calFile
  }
}
