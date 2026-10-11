"use client";

import { useEffect, useRef, useState } from "react";
import { publicEnv } from "@/lib/env";
import type { OrderStatus } from "@/lib/types";
import type { OrderChannel, ServerMessage } from "./types";

type TrackingState = {
  status: OrderStatus | null;
  connected: boolean;
  updatedAt: string | null;
};

const MAX_BACKOFF_MS = 10_000;
const PING_INTERVAL_MS = 25_000;

export function useOrderTracking(channel: OrderChannel | null): TrackingState {
  const [state, setState] = useState<TrackingState>({
    status: null,
    connected: false,
    updatedAt: null,
  });
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!channel) return;

    let closedByUs = false;
    let attempt = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let pingTimer: ReturnType<typeof setInterval> | undefined;

    const connect = () => {
      const socket = new WebSocket(publicEnv.wsUrl);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        attempt = 0;
        setState((prev) => ({ ...prev, connected: true }));
        socket.send(JSON.stringify({ action: "subscribe", channel }));
        pingTimer = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "ping" }));
          }
        }, PING_INTERVAL_MS);
      });

      socket.addEventListener("message", (event) => {
        let message: ServerMessage;
        try {
          message = JSON.parse(String(event.data)) as ServerMessage;
        } catch {
          return;
        }
        if (message.event === "order.status") {
          setState({
            status: message.data.status,
            updatedAt: message.data.updatedAt,
            connected: true,
          });
        }
      });

      const scheduleReconnect = () => {
        if (closedByUs) return;
        if (pingTimer) clearInterval(pingTimer);
        setState((prev) => ({ ...prev, connected: false }));
        attempt += 1;
        const delay = Math.min(1000 * 2 ** (attempt - 1), MAX_BACKOFF_MS);
        reconnectTimer = setTimeout(connect, delay);
      };

      socket.addEventListener("close", scheduleReconnect);
      socket.addEventListener("error", () => socket.close());
    };

    connect();

    return () => {
      closedByUs = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingTimer) clearInterval(pingTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [channel]);

  return state;
}
