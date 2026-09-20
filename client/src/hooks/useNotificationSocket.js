import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import { getAccessToken } from "../services/api.js";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function useNotificationSocket() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, { auth: { token: getAccessToken() } });

    socket.on("notification:new", (notification) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast(notification.title, { icon: "🔔" });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, queryClient]);
}
