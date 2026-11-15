# @miragon/client-sevdesk

Typed client for the [sevDesk](https://sevdesk.de) API. Generated from the
public sevDesk OpenAPI spec ([api.sevdesk.de/openapi.yaml](https://api.sevdesk.de/openapi.yaml))
with `@hey-api/openapi-ts`, plus Zod schemas for every model and request.

```bash
npm install @miragon/client-sevdesk
```

```ts
import {
  buildQuery,
  createSevdeskClient,
  responseData,
  sdk,
  type GetContactsResponse,
} from "@miragon/client-sevdesk"

const client = createSevdeskClient({
  apiToken: process.env.SEVDESK_API_TOKEN!,
  // baseUrl defaults to https://my.sevdesk.de/api/v1
})

const { objects: contacts } = await responseData<GetContactsResponse>(
  sdk.getContacts({
    client,
    query: buildQuery({ depth: 1, "category[id]": 3, "category[objectName]": "Category" }),
  }),
)
```

`createSevdeskClient` returns a configured `Client` (`throwOnError`,
`responseStyle: "data"`). The `Authorization` header carries the raw API token —
sevDesk uses no `Bearer` prefix. List responses arrive in an
`{ "objects": [...] }` envelope. Array query values are sent comma-separated
(`embed=contact,category`), as sevDesk expects. Uses `globalThis.fetch`; there
is no built-in retry or timeout — pass a `signal` per call and handle `429` in
the caller.

The generated SDK signatures are typed for hey-api's `"fields"` response style
(`{ data, error, … }`), while the client resolves to the body itself. Call sites
that read a result unwrap it with `responseData<T>()`, as above.

## Errors

An error response and a request that gets no response at all throw a
`SevdeskError`:

- `message` — the text sevDesk sent (whitespace collapsed, capped at 500
  characters), followed by `code` and `exceptionUUID` where present. An empty
  body yields `sevdesk returned no error details (HTTP 400 Bad Request)`.
- `status`, `code`, `exceptionUUID` — as far as sevDesk provided them.
- Transport failures carry no `status`; their message names the fetch error and
  its code (`sevdesk request failed: fetch failed (ECONNREFUSED)`), and the
  original error stays reachable as `cause`.

Cancelling a call with your own `signal` rethrows the `AbortError` /
`TimeoutError` unchanged. Errors while reading or parsing a successful
response (connection dropped mid-body, invalid JSON) are thrown as they are.

`createSevdeskClient` installs this as an error interceptor. With the generated
fetch client, every error interceptor receives the **original** error body and
the **last** one's return value is thrown. An interceptor you add yourself
therefore replaces the `SevdeskError` — compose with `toSevdeskError` to keep
it, and always return a value (returning `undefined` makes the client throw
`{}`):

```ts
import { toSevdeskError } from "@miragon/client-sevdesk"

client.interceptors.error.use((error, response) => {
  const sevdeskError = toSevdeskError(error, response)
  // …log, record response?.headers.get("retry-after"), …
  return sevdeskError
})
```

## Helpers

- `buildQuery(params)` — serialises query values the way sevDesk expects:
  booleans as `"true"`/`"false"`, arrays comma-joined, `undefined`/`null`
  dropped. Other values (objects, dates) are dropped as well — write sevDesk's
  filter keys out (`"contact[id]": 42, "contact[objectName]": "Contact"`).
- `collectionQuery<T>(params)` — `buildQuery` cast to an endpoint's query type,
  for the pagination parameters sevDesk accepts everywhere but documents only
  on some endpoints.
- `responseData<T>(call)` — unwraps an SDK call to the body it resolves to (see
  above).
- `getNextOrderNumber(client, orderType?)` — reserves the next order number
  (`/Order/Factory/getNextOrderNumber`, not in the spec).
- `zDiscardedTaxType` — `taxType` relaxed to optional; bookkeeping 2.0 derives
  it from `taxRule` and discards it.

## Migrating from 0.1

0.1 was a hand-written wrapper; 0.2 replaces it with the generated client.

- `client.get<T>(path, params)` / `post` / `put` / `del` are gone. Call the
  typed operation (`sdk.getContacts({ client, query })`) or, for a route
  without one, the generic client: `client.get({ url: "/Contact", query })`.
- The 429 retry (up to three attempts honouring `Retry-After`) and the 30 s
  request timeout are gone. A `429` now throws a `SevdeskError` with
  `status: 429`; retry in the caller and pass `signal` for a timeout.
- Errors are `SevdeskError`s with `status`/`code`/`exceptionUUID` instead of
  `Error("sevDesk API <status>: <body>")`.

## Regenerating

```bash
curl -sSLo packages/sevdesk/openapi.yaml https://api.sevdesk.de/openapi.yaml
npm run generate -w packages/sevdesk
```

`scripts/postprocess-zod.mjs` then relaxes the generated Zod schemas to what
sevDesk actually sends and accepts: `date-time` fields as plain strings, no
`.default(null)`, `.optional()` loosened to `.nullish()`. The checked-in code
was generated from the spec as published on 2026-11-14.
