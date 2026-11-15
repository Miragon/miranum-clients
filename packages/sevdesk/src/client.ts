import { createClient } from "./generated/client/client.gen.js"
import type { Client } from "./generated/client/types.gen.js"
import { toSevdeskError } from "./errors.js"

export type { Client }

const DEFAULT_BASE_URL = "https://my.sevdesk.de/api/v1"

export interface SevdeskClientConfig {
  apiToken: string
  baseUrl?: string
}

export function createSevdeskClient(config: SevdeskClientConfig): Client {
  const client = createClient({
    baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
    throwOnError: true,
    responseStyle: "data",
    // sevDesk takes multiple values comma-separated (`embed=contact,category`);
    // hey-api's default would repeat the key and sevDesk keeps only the last.
    querySerializer: { array: { explode: false, style: "form" } },
    headers: {
      // sevDesk expects the raw API token — no "Bearer" prefix.
      Authorization: config.apiToken,
      Accept: "application/json",
    },
  })

  // `throwOnError` throws the parsed error body verbatim — a plain object for
  // sevDesk, so every `String(e)` downstream renders "[object Object]" and the
  // actual diagnosis is lost. The interceptor's return value is what gets
  // thrown, so normalising here turns error responses and failed requests into
  // a real Error. A cancellation the caller asked for (their own `signal`)
  // keeps its identity, as it does when it lands while the body is read.
  client.interceptors.error.use((error, response) =>
    isCancellation(error) ? error : toSevdeskError(error, response),
  )

  return client
}

function isCancellation(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")
}
