import { readFileSync, writeFileSync } from "node:fs"

// Sevdesk's OpenAPI has three quirks that hey-api's zod codegen translates
// faithfully but that don't compile or don't match real sevdesk usage:
//
// 1. `format: date-time` is used for fields that actually accept
//    `dd.mm.yyyy` strings or unix timestamps, not ISO 8601. Strict
//    `z.iso.datetime()` would reject valid sevdesk payloads.
// 2. Many fields declare `default: null`, and that breaks two different
//    ways. Where the field is not also `nullable: true`, the generated
//    `.optional().default(null)` fails to typecheck in zod 4 (default
//    expects the wrapped type's input, not null). Where it IS nullable the
//    chain compiles but silently *injects* `null` on every parse — and
//    since these schemas are the MCP tools' input schemas, "the caller
//    omitted the field" turns into "the caller explicitly sent null" on the
//    wire. Model_Order alone contributes six such fields (headText,
//    footText, deliveryTerms, paymentTerms, address, customerInternalNote),
//    which is how saveOrder payloads reached sevdesk carrying nulls no
//    model ever asked for.
// 3. Sevdesk serializes nullable fields as explicit `null` rather than
//    omitting them. `.optional()` rejects `null`; `.nullish()` is the
//    union of `.optional()` and `.nullable()`, so the loosened schema
//    accepts both the absent-field case and the explicit-null case.
//
// We relax (1) to plain strings, drop every `.default(null)` for (2) —
// whatever modifier it is chained onto, on one line or wrapped — then
// loosen every remaining `.optional()` to `.nullish()` for (3).
const path = new URL("../src/generated/zod.gen.ts", import.meta.url)
const before = readFileSync(path, "utf8")

const DEFAULT_NULL = /\s*\.default\(\s*null\s*\)/g
// Deliberately looser than DEFAULT_NULL: a guard using the replacement pattern
// could never fire, since the replace above removes every one of its matches.
// This one still matches what DEFAULT_NULL cannot end — `.default(null as
// never)`, `.default(null!)` — i.e. exactly the variants worth failing on.
const ANY_DEFAULT_NULL = /\.default\(\s*null\b/

const isoMatches = before.match(/z\.iso\.datetime\(\)/g) ?? []
const defaultNullMatches = before.match(DEFAULT_NULL) ?? []

let after = before.replace(/z\.iso\.datetime\(\)/g, "z.string()")
after = after.replace(DEFAULT_NULL, "")

const optionalMatches = after.match(/\.optional\(\)/g) ?? []
after = after.replace(/\.optional\(\)/g, ".nullish()")

// Any surviving null default is the silent-null-injection bug from (2), so
// fail loudly instead of shipping schemas that rewrite the caller's payload.
if (ANY_DEFAULT_NULL.test(after)) {
  throw new Error(
    "postprocess-zod: .default(null) survived the patch — generated schemas would inject nulls " +
      "into tool payloads. Fix the pattern above before building.",
  )
}

if (after === before) {
  console.warn("postprocess-zod: no patches applied")
} else {
  writeFileSync(path, after)
  console.warn(
    `postprocess-zod: relaxed ${isoMatches.length} z.iso.datetime() -> z.string(), ` +
      `dropped ${defaultNullMatches.length} .default(null), ` +
      `loosened ${optionalMatches.length} .optional() -> .nullish()`,
  )
}
