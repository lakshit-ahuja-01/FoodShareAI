"use client"

import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

// Singleton socket instance — persists across re-renders
let socketInstance: Socket | null = null

export type FoodMatchedPayload = {
  title: string
  message: string
  foodId: string
  notificationId?: string  // MongoDB _id of the persisted Notification document
}

/**
 * useSocket — connects the current user to the backend WebSocket server.
 * Registers their userId so the server can emit targeted events.
 *
 * @param onFoodMatched  Callback fired when a food:matched event is received (NGO users only)
 */
export function useSocket(onFoodMatched?: (data: FoodMatchedPayload) => void) {
  const callbackRef = useRef(onFoodMatched)
  // Keep ref in sync without needing to re-run the effect
  callbackRef.current = onFoodMatched

  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    if (!token || !storedUser) return

    const user = JSON.parse(storedUser)

    // Derive socket URL from the API base (strip /api suffix)
    const SOCKET_URL =
      (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api").replace(/\/api$/, "")

    // Create singleton — only one connection per browser session
    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      })
    }

    const socket = socketInstance

    const handleConnect = () => {
      console.log("🔌 Socket connected:", socket.id)
      // Tell the server which user this socket belongs to
      socket.emit("register", user.id)
    }

    const handleFoodMatched = (data: FoodMatchedPayload) => {
      console.log("🍱 food:matched received:", data)
      callbackRef.current?.(data)
    }

    socket.on("connect", handleConnect)
    socket.on("food:matched", handleFoodMatched)

    // If already connected when the hook mounts, register immediately
    if (socket.connected) handleConnect()

    return () => {
      socket.off("connect", handleConnect)
      socket.off("food:matched", handleFoodMatched)
    }
  }, []) // Only run once — callback updates via ref

  return socketInstance
}
