// hooks/useMetaSocket.ts
import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

const SOCKET_URL =
  import.meta.env.VITE_WEB_SOCKET_URL || "http://localhost:3333"

export function useMetaSocket(
  onMessage: (payload: any) => void,
  conversationId: string
) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/meta`, { transports: ["websocket"] })
    socketRef.current = socket

    socket.emit("join-room", conversationId)

    socket.on("meta:new_message", (payload) => {
      onMessage(payload)
    })

    return () => {
      socket.disconnect()
    }
  }, [conversationId, onMessage])

  return socketRef.current
}
