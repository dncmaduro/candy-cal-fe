import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

const SOCKET_URL =
  import.meta.env.VITE_WEB_SOCKET_URL || "http://localhost:3333"

export function useSocket(
  onNotification: (payload: any) => void,
  userId: string
) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Connect socket
    const socket = io(SOCKET_URL, { transports: ["websocket"] })
    socketRef.current = socket

    // Join userId vào room để nhận noti cá nhân
    if (userId) {
      socket.emit("join-room", userId)
    }

    // Lắng nghe noti
    socket.on("notification", (payload) => {
      onNotification(payload)
    })

    // Cleanup
    return () => {
      socket.disconnect()
    }
  }, [userId, onNotification])

  return socketRef.current
}
