# @miranum/client-lexoffice

Hand-written, typed client for the [lexoffice](https://www.lexoffice.de) API.
Server-side only — uses Node's `Buffer` for multipart uploads.

```bash
pnpm add @miranum/client-lexoffice
```

```ts
import { createLexofficeClient } from "@miranum/client-lexoffice"

const client = createLexofficeClient({
  apiKey: process.env.LEXOFFICE_API_KEY!,
  // baseUrl defaults to https://api.lexoffice.io
})
```

`createLexofficeClient` returns a `Client` with `get`/`post`/`put`/`del`/
`download`/`upload` helpers (Bearer auth, retry-on-429, 30s timeout). Uses
`globalThis.fetch`.
