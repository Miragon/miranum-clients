# @miragon/clients

Typed API clients for the services Miranum apps integrate with, published to npm
so every consuming repo pulls a single, versioned source of truth instead of
carrying its own copy.

| Package                                           | Description          | Source                             |
| ------------------------------------------------- | -------------------- | ---------------------------------- |
| [`@miragon/client-clockin`](packages/clockin)     | clockIn customer API | generated (`@hey-api/openapi-ts`)  |
| [`@miragon/client-dimacon`](packages/dimacon)     | Dimacon API          | generated (`@hey-api/openapi-ts`)  |
| [`@miragon/client-lexoffice`](packages/lexoffice) | lexoffice API        | hand-written (Node, uses `Buffer`) |

## Usage

```bash
npm install @miragon/client-clockin
```

```ts
import { createClockInClient, sdk } from "@miragon/client-clockin"

const client = createClockInClient({ apiToken: process.env.CLOCKIN_API_TOKEN! })
const activities = await sdk.searchActivities({ client, body: {/* … */} })
```

Each package exposes a `createXClient(config)` factory returning a configured
`Client`, and an `sdk` namespace of typed operations. Clients rely on
`globalThis.fetch`; lexoffice additionally uses Node's `Buffer` (server-only).

## Development

Monorepo managed with **npm** workspaces (Node 22). Common tasks:

```bash
npm install
npm run build       # tsup → dist/ (ESM + .d.ts) for every package
npm run typecheck
npm run lint
npm run format:check
```

### Regenerating the OpenAPI clients

clockin and dimacon are generated from an OpenAPI spec that is **not** committed
(kept locally). Drop the spec next to the package (`packages/clockin/openapi.yaml`,
`packages/dimacon/open-api.json`) and run:

```bash
npm run generate -w packages/clockin
```

### Releasing

Versioning and publishing use
[release-please](https://github.com/googleapis/release-please):

1. Land changes on `main` using
   [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`,
   `feat!:` / `BREAKING CHANGE:` …). Each package versions independently.
2. release-please opens a **Release** PR (version bumps + changelogs). Merging it
   tags the releases and publishes only the changed packages to npm.

Publishing uses npm
[OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers) from the
`publish-npm-package.yml` workflow — no `NPM_TOKEN` required.
