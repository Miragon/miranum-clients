/**
 * Turns sevDesk's raw error payloads into real `Error` instances.
 *
 * With `throwOnError: true` the generated fetch client throws whatever it
 * parsed out of the error response — for sevDesk that is a plain object
 * (`{ error: { message, code, exceptionUUID } }`), not an `Error`. Every
 * consumer that stringifies a caught value then renders `[object Object]`, and
 * the diagnosis sevDesk sent — message, error code, exception UUID — is
 * discarded on the last metre.
 *
 * The client installs {@link toSevdeskError} as an error interceptor, so an
 * error response or a request that never got one is thrown as a `SevdeskError`:
 * `message` carries the sevDesk text, `status` the HTTP status (absent on
 * transport failures, whose original error is kept as `cause`).
 */

/** Longest message we take over from a response body (HTML error pages!). */
const MAX_MESSAGE_LENGTH = 500

/** Shape sevDesk uses for error responses; every field is best-effort. */
interface SevdeskErrorBody {
  error?: { message?: unknown; code?: unknown; exceptionUUID?: unknown }
  message?: unknown
}

export class SevdeskError extends Error {
  readonly status?: number
  readonly code?: string
  readonly exceptionUUID?: string

  constructor(
    message: string,
    details: { status?: number; code?: string; exceptionUUID?: string } = {},
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = "SevdeskError"
    this.status = details.status
    this.code = details.code
    this.exceptionUUID = details.exceptionUUID
  }
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) return value
  if (typeof value === "number") return String(value)
  return undefined
}

/** Collapses whitespace and caps the length, so an HTML page stays a one-liner. */
function clip(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim()
  return flat.length > MAX_MESSAGE_LENGTH ? `${flat.slice(0, MAX_MESSAGE_LENGTH)}…` : flat
}

/** First human-readable message we can find in a sevDesk error payload. */
function extractMessage(raw: unknown): string | undefined {
  if (typeof raw === "string") return raw.trim() || undefined
  if (raw === null || typeof raw !== "object") return undefined
  const body = raw as SevdeskErrorBody
  return asString(body.error?.message) ?? asString(body.message)
}

/** The generated client hands over `""` for an empty body, `{}` for an empty JSON one. */
function isEmptyBody(raw: unknown): boolean {
  if (raw === undefined || raw === null || raw === "") return true
  return typeof raw === "object" && !Array.isArray(raw) && Object.keys(raw).length === 0
}

/** Nothing quotable in the payload: keep the only evidence we have. */
function fallbackMessage(raw: unknown, response?: Response): string {
  if (response && isEmptyBody(raw)) {
    const status = [response.status, response.statusText].filter(Boolean).join(" ")
    return `sevdesk returned no error details (HTTP ${status})`
  }
  if (raw === undefined) return "unknown sevdesk error"
  return JSON.stringify(raw) ?? "unknown sevdesk error"
}

/**
 * Why a fetch failed, from undici's `cause`: its code (ECONNREFUSED, ENOTFOUND,
 * UND_ERR_SOCKET, …) or, lacking one, its message.
 */
function transportReason(error: Error): string | undefined {
  const { cause } = error as { cause?: unknown }
  if (cause === null || typeof cause !== "object") return undefined
  const { code, message } = cause as { code?: unknown; message?: unknown }
  return asString(code) ?? asString(message)
}

function extractDetails(raw: unknown): { code?: string; exceptionUUID?: string } {
  if (raw === null || typeof raw !== "object") return {}
  const { error } = raw as SevdeskErrorBody
  return { code: asString(error?.code), exceptionUUID: asString(error?.exceptionUUID) }
}

function describeDetails({
  code,
  exceptionUUID,
}: {
  code?: string
  exceptionUUID?: string
}): string {
  return [code && `code ${code}`, exceptionUUID && `exceptionUUID ${exceptionUUID}`]
    .filter(Boolean)
    .join(", ")
}

/**
 * Normalises anything the fetch client is about to throw into a `SevdeskError`.
 *
 * Handles three sources: a parsed sevDesk JSON error body, a bare text body
 * (sevDesk occasionally answers HTML/plain text), and transport failures
 * (`TypeError: fetch failed`, aborts) where there is no response at all.
 * `createSevdeskClient` lets caller-initiated aborts through before calling it.
 */
export function toSevdeskError(raw: unknown, response?: Response): SevdeskError {
  if (raw instanceof SevdeskError) return raw

  const details = extractDetails(raw)

  // Transport failure: no response, and the thrown value is already an Error.
  // undici keeps the actual reason (ECONNREFUSED, UND_ERR_SOCKET, …) in
  // `cause`, so it stays reachable — retry logic walks that chain.
  if (!response && raw instanceof Error) {
    const reason = transportReason(raw)
    return new SevdeskError(
      `sevdesk request failed: ${raw.message}${reason ? ` (${reason})` : ""}`,
      details,
      { cause: raw },
    )
  }

  const message = clip(extractMessage(raw) ?? fallbackMessage(raw, response))
  const suffix = describeDetails(details)

  return new SevdeskError(suffix ? `${message} (${suffix})` : message, {
    ...details,
    status: response?.status,
  })
}
