# @miranum/clients

Typed API clients for the services Miranum apps integrate with, published to npm
so every consuming repo pulls a single, versioned source of truth instead of
carrying its own copy.

| Package | Description | Source |
| --- | --- | --- |
| [`@miranum/client-clockin`](packages/clockin) | clockIn customer API | generated (`@hey-api/openapi-ts`) |
| [`@miranum/client-dimacon`](packages/dimacon) | Dimacon API | generated (`@hey-api/openapi-ts`) |
| [`@miranum/client-lexoffice`](packages/lexoffice) | lexoffice API | hand-written (Node, uses `Buffer`) |

## Usage

```bash
pnpm add @miranum/client-clockin
```

```ts
import { createClockInClient, sdk } from "@miranum/client-clockin"

const client = createClockInClient({ apiToken: process.env.CLOCKIN_API_TOKEN! })
const activities = await sdk.searchActivities({ client, body: { /* … */ } })
```

Each package exposes a `createXClient(config)` factory returning a configured
`Client`, and an `sdk` namespace of typed operations. Clients rely on
`globalThis.fetch`; lexoffice additionally uses Node's `Buffer` (server-only).

## Development

Monorepo managed with **pnpm** (Node 22). Common tasks:

```bash
pnpm install
pnpm build          # tsup → dist/ (ESM + .d.ts) for every package
pnpm typecheck
pnpm lint
pnpm format:check
```

### Regenerating the OpenAPI clients

clockin and dimacon are generated from an OpenAPI spec that is **not** committed
(kept locally). Drop the spec next to the package (`packages/clockin/openapi.yaml`,
`packages/dimacon/open-api.json`) and run:

```bash
pnpm --filter @miranum/client-clockin generate
```

### Releasing

Versioning and publishing use [Changesets](https://github.com/changesets/changesets):

1. Add a changeset with your PR: `pnpm changeset`.
2. Merging to `main` opens a **Version Packages** PR (bumps + changelogs).
3. Merging that PR builds and publishes the changed packages to npm.

Requires the `@miranum` npm scope and an `NPM_TOKEN` automation token stored as a
GitHub Actions secret.
