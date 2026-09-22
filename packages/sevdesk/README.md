# @miragon/client-sevdesk

Hand-written, typed client for the [sevDesk](https://sevdesk.de) API.

```bash
npm install @miragon/client-sevdesk
```

```ts
import { createSevdeskClient } from "@miragon/client-sevdesk"

const client = createSevdeskClient({
  apiToken: process.env.SEVDESK_API_TOKEN!,
  // baseUrl defaults to https://my.sevdesk.de/api/v1
})

const contacts = await client.get<{ objects: unknown[] }>("/Contact", { limit: "100" })
```

`createSevdeskClient` returns a `Client` with `get`/`post`/`put`/`del` helpers
(retry-on-429, 30s timeout). The `Authorization` header carries the raw API
token — sevDesk uses no `Bearer` prefix. List responses arrive in an
`{ "objects": [...] }` envelope. Uses `globalThis.fetch`.
