const BASE_URL = "https://my.sevdesk.de/api/v1"
const MAX_RETRIES = 3
const REQUEST_TIMEOUT = 30_000

export interface SevdeskClientConfig {
  apiToken: string
  baseUrl?: string
}

export interface Client {
  get<T>(path: string, params?: Record<string, string>): Promise<T>
  post<T>(path: string, body?: unknown): Promise<T>
  put<T>(path: string, body?: unknown): Promise<T>
  del<T>(path: string): Promise<T>
}

export function createSevdeskClient(config: SevdeskClientConfig): Client {
  const baseUrl = config.baseUrl ?? BASE_URL
  const apiToken = config.apiToken

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string>,
  ): Promise<T> {
    let url = `${baseUrl}${path}`
    if (params) {
      const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
      const qs = new URLSearchParams(filtered).toString()
      if (qs) url += (path.includes("?") ? "&" : "?") + qs
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      // sevDesk expects the raw API token — no "Bearer" prefix.
      Authorization: apiToken,
    }
    if (body) headers["Content-Type"] = "application/json"

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      try {
        const res = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        })

        if (res.status === 429 && attempt < MAX_RETRIES) {
          const retryAfter = Number(res.headers.get("retry-after") ?? String(2 ** attempt))
          await new Promise((r) => setTimeout(r, retryAfter * 1000))
          continue
        }

        if (res.status === 204) return undefined as T

        if (!res.ok) {
          const text = await res.text().catch(() => "")
          throw new Error(`sevDesk API ${res.status}: ${text || res.statusText}`)
        }

        return (await res.json()) as T
      } finally {
        clearTimeout(timeout)
      }
    }

    throw new Error("sevDesk API: max retries exceeded")
  }

  return {
    get: <T>(path: string, params?: Record<string, string>) =>
      request<T>("GET", path, undefined, params),
    post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
    put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
    del: <T>(path: string) => request<T>("DELETE", path),
  }
}
