import { createClient } from "./generated/client/client.gen.js"
import type { Client } from "./generated/client/types.gen.js"

export type { Client }

export interface DimaconClientOptions {
  baseUrl: string
  tenant: string
  apiToken: string
}

export function createDimaconClient(options: DimaconClientOptions): Client {
  return createClient({
    baseUrl: options.baseUrl,
    throwOnError: true,
    responseStyle: "data",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "@miranum/client-dimacon/0.1.0",
      Authorization: `Bearer ${options.apiToken}`,
      tenant: options.tenant,
    },
  })
}
