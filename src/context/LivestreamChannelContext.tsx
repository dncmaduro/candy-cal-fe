import { createContext, useContext, ReactNode } from "react"

interface LivestreamChannelContextType {
  selectedChannelId: string | null
  channels: Array<{
    _id: string
    name: string
    username: string
    link: string
  }>
  isLoading: boolean
}

const LivestreamChannelContext = createContext<
  LivestreamChannelContextType | undefined
>(undefined)

export const LivestreamChannelProvider = ({
  children,
  value
}: {
  children: ReactNode
  value: LivestreamChannelContextType
}) => {
  return (
    <LivestreamChannelContext.Provider value={value}>
      {children}
    </LivestreamChannelContext.Provider>
  )
}

export const useLivestreamChannel = () => {
  const context = useContext(LivestreamChannelContext)
  if (context === undefined) {
    throw new Error(
      "useLivestreamChannel must be used within LivestreamChannelProvider"
    )
  }
  return context
}
