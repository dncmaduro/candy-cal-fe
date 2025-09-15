import { useUserStore } from "../store/userStore"
import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import {
  CalXlsxShopeeRequest,
  CalXlsxShopeeResponse,
  CreateShopeeProductRequest,
  SearchShopeeProductsRequest,
  SearchShopeeProductsResponse,
  UpdateShopeeProductRequest
} from "./models"

export const useShopeeProducts = () => {
  const { accessToken } = useUserStore()

  const createShopeeProduct = async (req: CreateShopeeProductRequest) => {
    return callApi<CreateShopeeProductRequest, never>({
      path: `/v1/shopeeproducts`,
      method: "POST",
      data: req,
      token: accessToken
    })
  }

  const updateShopeeProduct = async (
    productId: string,
    req: UpdateShopeeProductRequest
  ) => {
    return callApi<UpdateShopeeProductRequest, never>({
      path: `/v1/shopeeproducts/${productId}`,
      method: "PUT",
      data: req,
      token: accessToken
    })
  }

  const deleteShopeeProduct = async (productId: string) => {
    return callApi<never, never>({
      path: `/v1/shopeeproducts/${productId}`,
      method: "DELETE",
      token: accessToken
    })
  }

  const getAllShopeeProducts = async () => {
    return callApi<never, never>({
      path: `/v1/shopeeproducts`,
      method: "GET",
      token: accessToken
    })
  }

  const getShopeeProductById = async (productId: string) => {
    return callApi<never, never>({
      path: `/v1/shopeeproducts/${productId}`,
      method: "GET",
      token: accessToken
    })
  }

  const searchShopeeProducts = async (req: SearchShopeeProductsRequest) => {
    const query = toQueryString(req)

    return callApi<SearchShopeeProductsRequest, SearchShopeeProductsResponse>({
      path: `/v1/shopeeproducts/search?${query}`,
      method: "GET",
      token: accessToken
    })
  }

  const calShopeeByXlsx = async (req: CalXlsxShopeeRequest) => {
    const formData = new FormData()
    formData.append("file", req.file)

    return callApi<FormData, CalXlsxShopeeResponse>({
      path: `/v1/shopeeproducts/cal-xlsx`,
      data: formData,
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      token: accessToken
    })
  }

  return {
    createShopeeProduct,
    updateShopeeProduct,
    deleteShopeeProduct,
    getAllShopeeProducts,
    getShopeeProductById,
    searchShopeeProducts,
    calShopeeByXlsx
  }
}
