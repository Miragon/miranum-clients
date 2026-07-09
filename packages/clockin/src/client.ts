import { createClient } from "./generated/client/client.gen.js"
import type { Client } from "./generated/client/types.gen.js"

export type { Client }

const DEFAULT_BASE_URL = "https://customerapi.clockin.de"

export interface ClockInClientConfig {
  apiToken: string
  baseUrl?: string
}

export function createClockInClient(config: ClockInClientConfig): Client {
  return createClient({
    baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
    throwOnError: true,
    responseStyle: "data",
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      Accept: "application/json",
    },
  })
}
