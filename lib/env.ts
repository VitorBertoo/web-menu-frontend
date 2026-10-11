export const publicEnv = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3000/ws",
  menuHost: process.env.NEXT_PUBLIC_MENU_HOST ?? "menu.localhost",
} as const;

export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.API_BASE_URL ?? publicEnv.apiBaseUrl;
  }
  return publicEnv.apiBaseUrl;
}
