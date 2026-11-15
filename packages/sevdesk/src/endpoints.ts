/**
 * Endpoints sevDesk implements but does not publish in its OpenAPI spec, so
 * the generated SDK has no function for them.
 *
 * Everything here is measured against a live account rather than read off the
 * spec — that is the only source of truth available for these routes.
 */
import type { Client } from "./client.js"
import { buildQuery, responseData } from "./types.js"

/** sevDesk answers its number factories with the bare string in `objects`. */
interface NextNumberResponse {
  objects?: unknown
}

/**
 * Reserves and returns the next free document number for an order type.
 *
 * `POST /Order/Factory/saveOrder` rejects an order without `orderNumber` with a
 * bare 400 — unlike saveInvoice, sevDesk assigns nothing here. A caller that
 * has no number scheme of its own therefore has to ask for one, which is what
 * this endpoint is for: `useNextNumber=true` advances the counter, exactly as
 * the sevDesk UI does when a user opens a new order.
 *
 * @param orderType 'AN' (Angebot), 'AB' (Auftragsbestätigung) or 'LI'
 *   (Lieferschein) — each has its own counter. Defaults to 'AN'.
 */
export async function getNextOrderNumber(
  client: Client,
  orderType?: string | null,
): Promise<string> {
  const result = await responseData<NextNumberResponse>(
    client.get({
      url: "/Order/Factory/getNextOrderNumber",
      query: buildQuery({ orderType: orderType ?? "AN", useNextNumber: true }),
    }),
  )

  const number = result?.objects
  if (typeof number !== "string" || number.length === 0) {
    throw new Error(
      "sevdesk returned no next order number — pass orderNumber explicitly on the order.",
    )
  }
  return number
}
