import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"

export type AvailableCs = { _id: string; salesCsId: { _id: string; name: string; username: string }; isReceivingLeads: boolean }
export type LeadCase = Record<string, unknown>
export type CallCompliance = {
  cycleKey: string
  total: number
  called: number
  missingCall: number
  bySalesCs: Array<{
    salesCs: { _id: string; name: string; username: string }
    total: number
    called: number
    missingCall: number
  }>
}

export const useSalesLeads = () => {
  const { accessToken } = useUserStore()
  const request = <T>(path: string, method = "GET", data?: unknown) => callApi<unknown, T>({ path: `/v1/sales-leads${path}`, method, data, token: accessToken })
  return {
    availableCs: () => request<AvailableCs[]>("/available-cs"),
    createLead: (data: unknown) => request<LeadCase>("", "POST", data),
    pool: () => request<LeadCase[]>("/pool"),
    assign: (id: string, salesCsId: string, channelId?: string) =>
      request<LeadCase>(`/${id}/assign`, "POST", { salesCsId, channelId }),
    acquired: () => request<LeadCase[]>("/mine/acquired"),
    active: (needsCall = false) => request<LeadCase[]>(`/mine/active${needsCall ? "?needsCall=true" : ""}`),
    detailByFunnel: (funnelId: string) => request<LeadCase | null>(`/by-funnel/${funnelId}`),
    detail: (id: string) => request<LeadCase>(`/${id}`),
    calls: (id: string) => request<LeadCase[]>(`/${id}/calls`),
    addCall: (id: string, data: unknown) => request<LeadCase>(`/${id}/calls`, "POST", data),
    transfer: (id: string, salesCsId: string) => request<LeadCase>(`/${id}/transfer`, "POST", { salesCsId }),
    availability: () => request<AvailableCs[]>("/availability"),
    setAvailability: (id: string, isReceivingLeads: boolean) => request<AvailableCs>(`/availability/${id}`, "PATCH", { isReceivingLeads }),
    callCompliance: (cycleKey?: string) =>
      request<CallCompliance>(`/reports/call-compliance${cycleKey ? `?cycleKey=${cycleKey}` : ""}`)
  }
}
