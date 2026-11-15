import { z } from "zod"

/**
 * `taxType` on the invoice and order factories, relaxed to optional.
 *
 * Under bookkeeping 2.0 sevDesk derives the tax treatment from `taxRule` and
 * discards `taxType` outright: the stored value is null whether the field was
 * sent or omitted, and reading the document back confirms it (measured
 * 2026-08-14 across taxType 'default', 'eu' and no taxType at all — taxRule
 * took effect every time). The spec still marks it required, which forces
 * every caller to invent a value for a field that cannot survive the write.
 * Bookkeeping 1.0 accounts do use it, so it stays accepted — just no longer
 * demanded.
 */
export const zDiscardedTaxType = z
  .string()
  .nullish()
  .describe("Bookkeeping 1.0 only; under 2.0 taxRule applies and this is discarded")

/**
 * Awaits a generated SDK call and returns the payload it actually resolves to.
 *
 * `createSevdeskClient` runs with `responseStyle: "data"`, so every SDK
 * function resolves to the response body. The generated signatures do not
 * model that — they are typed for the default `"fields"` style
 * (`{ data, error, request, response }`) — so code that *reads* a response has
 * to reconcile the two. Code that only hands the result on never notices;
 * this is for the call sites that inspect it.
 */
export async function responseData<T>(call: PromiseLike<unknown>): Promise<T> {
  return (await call) as T
}

/**
 * Same as {@link buildQuery}, for endpoints whose generated query type is
 * narrower than what sevDesk actually accepts.
 *
 * sevDesk applies `limit`, `offset`, `countAll` and `embed` to every
 * collection endpoint, but its OpenAPI spec only documents them on some
 * (`/ContactAddress` declares no query parameters at all, `/VoucherPos` and
 * `/CheckAccountTransaction` only their entity filters). The generated types
 * mirror the spec, so passing pagination there needs a cast — this function
 * is that cast, in one audited place instead of one per call site.
 */
export function collectionQuery<T>(params: Record<string, unknown>): T {
  return buildQuery(params) as T
}

/**
 * Serialises query values the way sevDesk expects them: booleans as
 * `"true"`/`"false"`, arrays comma-joined (`embed=contact,category`),
 * `undefined`/`null` dropped. Bracketed filter keys such as `contact[id]` pass
 * through unchanged.
 */
export function buildQuery(params: Record<string, unknown>): Record<string, string | undefined> {
  const query: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (typeof value === "boolean") {
      query[key] = value ? "true" : "false"
    } else if (typeof value === "number") {
      query[key] = String(value)
    } else if (typeof value === "string") {
      query[key] = value
    } else if (Array.isArray(value)) {
      query[key] = value.join(",")
    }
  }
  return query
}
