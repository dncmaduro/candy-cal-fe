import axios, { AxiosRequestConfig, AxiosResponse } from "axios"

type AxiosCallApi<D> = {
  path: string
  data?: D
  token?: string
  customUrl?: string
  method: AxiosRequestConfig["method"]
}

export async function callApi<D = unknown, T = unknown>({
  path,
  data,
  token,
  customUrl,
  method
}: AxiosCallApi<D>): Promise<AxiosResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json"
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await axios<T>({
    url: (customUrl ?? import.meta.env.VITE_BACKEND_URL) + path,
    headers,
    data,
    method
  })

  return response
}
