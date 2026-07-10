# @miragon/client-clockin

Typed client for the [clockIn](https://clockin.de) customer API. Generated from
the clockIn OpenAPI spec with `@hey-api/openapi-ts`.

```bash
npm install @miragon/client-clockin
```

```ts
import { createClockInClient, sdk } from "@miragon/client-clockin"

const client = createClockInClient({
  apiToken: process.env.CLOCKIN_API_TOKEN!,
  // baseUrl defaults to https://customerapi.clockin.de
})

const activities = await sdk.searchActivities({ client, body: {/* … */} })
```

`createClockInClient` returns a configured `Client` (Bearer auth,
`throwOnError`, `responseStyle: "data"`). Uses `globalThis.fetch`.
