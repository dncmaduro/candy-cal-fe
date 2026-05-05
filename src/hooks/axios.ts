import axios, { AxiosRequestConfig, AxiosResponse } from "axios"

type AxiosCallApi<D> = {
  path: string
  data?: D
  token?: string
  customUrl?: string
  method: AxiosRequestConfig["method"]
  headers?: Record<string, string>
  responseType?: AxiosRequestConfig["responseType"] // ✅ thêm
}

let latestApiErrorMessage: { message: string; at: number } | null = null

const getMessageFromUnknown = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  if (Array.isArray(value)) {
    const joined = value
      .map((item) => getMessageFromUnknown(item))
      .filter((item): item is string => Boolean(item))
      .join(", ")
      .trim()

    return joined.length > 0 ? joined : undefined
  }

  if (value && typeof value === "object") {
    const maybeMessage = getMessageFromUnknown(
      (value as { message?: unknown }).message
    )
    if (maybeMessage) return maybeMessage

    const maybeError = getMessageFromUnknown(
      (value as { error?: unknown }).error
    )
    if (maybeError) return maybeError
  }

  return undefined
}

export const extractApiErrorMessage = (error: unknown): string | undefined => {
  if (axios.isAxiosError(error)) {
    const fromResponseData = getMessageFromUnknown(error.response?.data)
    if (fromResponseData) return fromResponseData

    const fromStatusText = getMessageFromUnknown(error.response?.statusText)
    if (fromStatusText) return fromStatusText
  }

  return getMessageFromUnknown((error as { message?: unknown })?.message)
}

export const consumeLatestApiErrorMessage = (
  maxAgeMs = 3000
): string | undefined => {
  if (!latestApiErrorMessage) return undefined

  if (Date.now() - latestApiErrorMessage.at > maxAgeMs) {
    latestApiErrorMessage = null
    return undefined
  }

  const message = latestApiErrorMessage.message
  latestApiErrorMessage = null
  return message
}

export async function callApi<D = unknown, T = unknown>({
  path,
  data,
  token,
  customUrl,
  method,
  headers,
  responseType // ✅ thêm
}: AxiosCallApi<D>): Promise<AxiosResponse<T>> {
  const convertedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers
  }

  if (token) convertedHeaders["Authorization"] = `Bearer ${token}`

  try {
    const response = await axios<T>({
      url: (customUrl ?? import.meta.env.VITE_BACKEND_URL) + path,
      headers: convertedHeaders,
      data,
      method,
      responseType: responseType ?? "json" // ✅ dùng override
    })

    return response
  } catch (error) {
    const apiMessage = extractApiErrorMessage(error)

    if (apiMessage) {
      latestApiErrorMessage = {
        message: apiMessage,
        at: Date.now()
      }

      if (axios.isAxiosError(error)) {
        error.message = apiMessage
      }
    }

    throw error
  }
}
