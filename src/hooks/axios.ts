import axios, { AxiosRequestConfig, AxiosResponse } from "axios"

type AxiosCallApi<D> = {
  path: string
  data?: D
  token?: string
  customUrl?: string
  method: AxiosRequestConfig["method"]
  headers?: Record<string, string>
}

export async function callApi<D = unknown, T = unknown>({
  path,
  data,
  token,
  customUrl,
  method,
  headers
}: AxiosCallApi<D>): Promise<AxiosResponse<T>> {
  const convertedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers
  }

  if (token) {
    convertedHeaders["Authorization"] = `Bearer ${token}`
  }

  const response = await axios<T>({
    url: (customUrl ?? import.meta.env.VITE_BACKEND_URL) + path,
    headers: convertedHeaders,
    data,
    method
  })

  return response
}
