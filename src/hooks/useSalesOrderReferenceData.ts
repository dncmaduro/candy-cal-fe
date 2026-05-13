import { useQuery } from "@tanstack/react-query"
import { useSalesChannels } from "./useSalesChannels"
import { useSalesFunnel } from "./useSalesFunnel"
import { useUsers } from "./useUsers"

type UseSalesOrderReferenceDataParams = {
  enabled?: boolean
}

export const useSalesOrderReferenceData = ({
  enabled = true
}: UseSalesOrderReferenceDataParams = {}) => {
  const { searchFunnel, getFunnelByUser } = useSalesFunnel()
  const { searchSalesChannels, getMyChannel } = useSalesChannels()
  const { getMe } = useUsers()

  const { data: meData } = useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })

  const me = meData?.data

  const isAdmin = me?.roles.includes("admin")
  const isSystemEmp = me?.roles.includes("system-emp")
  const isSalesLeader = me?.roles.includes("sales-leader")
  const isSalesEmp = me?.roles.includes("sales-emp")
  const isAccountingEmp =
    me?.roles.includes("accounting-emp") ||
    me?.roles.includes("sales-accounting")

  const canSeeAllFunnels = isAdmin || isSystemEmp || isSalesLeader

  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 }),
    enabled,
    staleTime: 100000,
    refetchOnWindowFocus: false
  })

  const { data: myChannelData } = useQuery({
    queryKey: ["getMyChannel"],
    queryFn: getMyChannel,
    select: (data) => data.data,
    enabled: enabled && !!me,
    staleTime: 100000,
    refetchOnWindowFocus: false
  })

  const { data: funnelData } = useQuery({
    queryKey: ["salesFunnel", canSeeAllFunnels ? "all" : me?._id],
    queryFn: async () => {
      if (canSeeAllFunnels) {
        return await searchFunnel({
          page: 1,
          limit: 999
        })
      }

      if (me?._id) {
        return await getFunnelByUser(me._id, {
          limit: 999
        })
      }

      return undefined
    },
    enabled: enabled && !!me,
    staleTime: 100000,
    refetchOnWindowFocus: false
  })

  return {
    me,
    channelsData,
    myChannelData,
    funnelData,
    canSeeAllFunnels,
    isSalesEmp,
    isAccountingEmp
  }
}
