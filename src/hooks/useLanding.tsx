import { toQueryString } from "../utils/toQuery"
import { callApi } from "./axios"
import { LandingRequest, LandingResponse } from "./models"

export const useLanding = () => {
  const getLandingData = async (req: LandingRequest) => {
    const query = toQueryString({
      page: req.page,
      pageSize: req.pageSize
    })

    return callApi<never, LandingResponse>({
      path: `/order?${query}`,
      method: "GET",
      customUrl: "https://www.mycandyvn.shop/api"
    })
  }

  return { getLandingData }
}
