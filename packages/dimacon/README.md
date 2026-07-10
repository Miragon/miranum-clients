# @miragon/client-dimacon

Typed client for the Dimacon API. Generated from the Dimacon OpenAPI spec with
`@hey-api/openapi-ts`.

```bash
npm install @miragon/client-dimacon
```

```ts
import { createDimaconClient, sdk } from "@miragon/client-dimacon"

const client = createDimaconClient({
  baseUrl: process.env.DIMACON_BASE_URL!,
  tenant: process.env.DIMACON_TENANT!,
  apiToken: process.env.DIMACON_API_TOKEN!,
})

const jobs = await sdk.listJobs({ client })
```

`createDimaconClient` returns a configured `Client` (Bearer auth, `tenant`
header, `throwOnError`, `responseStyle: "data"`). Uses `globalThis.fetch`.
