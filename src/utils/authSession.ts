import { QueryClient } from "@tanstack/react-query"

export const resetSessionCache = (queryClient: QueryClient) => {
  queryClient.clear()
}
