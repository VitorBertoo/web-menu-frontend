import { getApiBaseUrl } from "@/lib/env";
import { parseApiError } from "./errors";

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
  baseUrl?: string;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, token, baseUrl, headers, ...init } = options;
  const base = baseUrl ?? getApiBaseUrl();
  const url = /^https?:\/\//.test(path) ? path : `${base}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
