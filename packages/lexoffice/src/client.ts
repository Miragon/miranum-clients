const BASE_URL = "https://api.lexoffice.io"
const MAX_RETRIES = 3
const REQUEST_TIMEOUT = 30_000

export interface LexofficeClientConfig {
  apiKey: string
  baseUrl?: string
}

export interface Client {
  get<T>(path: string, params?: Record<string, string>): Promise<T>
  post<T>(path: string, body?: unknown): Promise<T>
  put<T>(path: string, body?: unknown): Promise<T>
  del<T>(path: string): Promise<T>
  download(path: string): Promise<{ data: Buffer; fileName: string; contentType: string }>
  upload<T>(path: string, fileName: string, content: Buffer, mimeType?: string): Promise<T>
}

export function createLexofficeClient(config: LexofficeClientConfig): Client {
  const baseUrl = config.baseUrl ?? BASE_URL
  const apiKey = config.apiKey

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
      Authorization: `Bearer ${apiKey}`,
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
          throw new Error(`Lexoffice API ${res.status}: ${text || res.statusText}`)
        }

        return (await res.json()) as T
      } finally {
        clearTimeout(timeout)
      }
    }

    throw new Error("Lexoffice API: max retries exceeded")
  }

  return {
    get: <T>(path: string, params?: Record<string, string>) =>
      request<T>("GET", path, undefined, params),
    post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
    put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
    del: <T>(path: string) => request<T>("DELETE", path),

    async download(path: string) {
      const res = await fetch(`${baseUrl}${path}`, {
        headers: { Accept: "application/pdf", Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) throw new Error(`Lexoffice API ${res.status}: ${res.statusText}`)
      const contentType = res.headers.get("Content-Type")?.split(";")[0].trim() ?? "application/pdf"
      const disposition = res.headers.get("Content-Disposition") ?? ""
      const fileNameMatch = disposition.match(/filename="?([^";\n]+)"?/)
      const fileName = fileNameMatch?.[1] ?? "document.pdf"
      return { data: Buffer.from(await res.arrayBuffer()), fileName, contentType }
    },

    async upload<T>(path: string, fileName: string, content: Buffer, mimeType = "application/pdf") {
      const boundary = `----FormBoundary${Date.now()}`
      const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`
      const footer = `\r\n--${boundary}--\r\n`
      const body = Buffer.concat([Buffer.from(header), content, Buffer.from(footer)])

      const res = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
        },
        body,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`Lexoffice API ${res.status}: ${text || res.statusText}`)
      }
      if (res.status === 204) return undefined as T
      return (await res.json()) as T
    },
  }
}
