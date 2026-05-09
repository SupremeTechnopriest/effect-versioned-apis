# Restructure Notes (Lean)

## Goals

- One copy of every piece of logic. No duplication across versions.
- Clear separation between version-agnostic code (domain, services,
  endpoint factories, handlers) and version-specific code (groups, http
  bindings).
- Cutting a new version is small, mechanical, and additive.
- Dropping a deprecated version is a directory-level delete plus one import
  line.
- File granularity matches actual cognitive boundaries — not preemptive
  splitting.

## Bug fix from the original

`src/domain/demo/service.ts` originally wrapped the result in `Effect.succeed`
without `return`/`yield`, so the service returned `void`. Fixed.

## Layout

```
src/
  domain/
    demo/
      model.ts        # canonical domain types — version-agnostic
      service.ts      # business logic — version-agnostic
      endpoints.ts    # all endpoint factories for this domain
      handlers.ts     # all handler functions for this domain
      v0.ts           # v0 group (which endpoints + which schemas)
      v1.ts           # v1 group
  http/
    index.ts          # mergeAll active versions
    v0.ts             # top-level HttpApi + handler bindings + layer for v0
    v1.ts             # same for v1
  middleware/         # unchanged from original
  layers/             # unchanged from original
  index.ts            # unchanged from original
```

For a single domain, that's six API files: model, service, endpoints,
handlers, v0 group, v1 group — plus three top-level http files. Adding a
domain duplicates the domain folder pattern (six files); adding a version
adds a group file per domain plus one `http/vN.ts` file.

## What each file does

### Version-agnostic (one copy, forever)

**`domain/<entity>/model.ts`** — canonical domain shape. No wire concerns,
no version awareness. The "internal truth" of what an entity is.

**`domain/<entity>/service.ts`** — business logic. Speaks in canonical
domain types. Knows nothing about HTTP, wire formats, or versions.

**`domain/<entity>/endpoints.ts`** — endpoint factories. Each is a function
parameterized by the schemas it consumes/produces, returning an
`HttpApiEndpoint`. The factory holds path, method, payload, and OpenAPI
metadata; schemas vary per version. One file per domain because at small
scale, individual endpoint definitions are 10–15 lines and grouping by
domain reads better than splitting per-endpoint.

**`domain/<entity>/handlers.ts`** — handler functions. Plain functions from
request to effect. The framework type-checks at the binding site that the
function matches the version's endpoint shape, so the same handler value
gets passed to multiple version bindings.

### Per-version (one file per version per domain)

**`domain/<entity>/v{N}.ts`** — defines the version's group. Picks which
endpoints exist in this version and supplies their schemas. When schemas
diverge from canonical (v1 here), the divergent schemas live inline in
this file. Lift them into a separate `schemas/v{N}.ts` only when the
schemas grow large or get reused across multiple groups within the version.

### Per-version (one file per version, top-level)

**`http/v{N}.ts`** — three things in one file:

1. The version's top-level `HttpApi` (mounts groups, applies prefix).
2. Handler bindings (`HttpApiBuilder.group` calls).
3. The merged layer with middleware applied.

These three things are tightly coupled — the bindings need the prefixed
API in scope, the layer needs the bindings — so splitting them into three
files just means three files that always change together. Kept as one.

### Top-level wiring (one file)

**`http/index.ts`** — `Layer.mergeAll(v0, v1, ...)`. Adding a version is
one import + one mergeAll arg. Dropping a version is removing both.

## Why no `schemas/` directory

The earlier draft had `schemas/v0.ts`, `schemas/v1.ts` files even when v0's
schemas were just re-exports of the canonical model. That's preemptive
splitting — it adds files that exist purely to hold a future seam.

The lean structure: schemas live inline in the version's group file when
they diverge, and you reach for the canonical model directly when they
don't. Lift to a dedicated `schemas/v{N}.ts` when:

- The schemas in `v{N}.ts` exceed maybe 30–40 lines, or
- Multiple groups within the same version share schemas, or
- You need to define encoder/decoder transforms that warrant their own file.

This is a "split when needed" rule, not a "split preemptively" rule.

## Why no separate `endpoints/<name>.ts` files

At one factory per file, you end up with 5+ files in `endpoints/` that are
each 10–15 lines. They all change together when you add the next endpoint
to the same domain (because OpenAPI metadata, path conventions, and
import patterns are domain-level decisions). Grouping them by domain is
the natural unit.

Split to per-endpoint files when:

- An individual factory exceeds ~50 lines (e.g., complex annotation logic,
  multiple response variants, custom security schemes).
- You're sharing endpoint factories across domains (rare).

## Why no separate `handlers/<name>.ts` files

Same reasoning. Handlers in the same domain frequently share helpers and
are read together. One file per domain until the file gets unwieldy.

## Why group + binding aren't in the same file

The version's group file (`v0.ts`) defines the API contract — what
endpoints exist, what schemas they use. This is what gets exported and
consumed by other tools (OpenAPI generation, client SDK derivation,
contract tests).

The binding file (`http/v0.ts`) wires handlers to the contract. It's
server-side only, and it depends on the prefixed `HttpApi` rather than
the raw group.

Keeping them separate matters because:

1. Code that consumes the contract (clients, codegen) shouldn't drag in
   server-side dependencies.
2. The handler binding type-checks against the prefixed endpoint
   (`HttpApi.prefix("/v0")` rewrites paths), so it lives where the
   prefixed API is in scope.

## Carrying forward an endpoint

When v1 keeps `/demo` from v0:

1. v1's group calls the same `getDemoEndpoint(...)` factory from
   `endpoints.ts`.
2. v1's binding passes the same `getDemo` handler from `handlers.ts` to
   `handlers.handle("get", ...)`.

Zero code is duplicated. The factory is invoked twice; the handler value
is referenced from two binding sites. That's it.

## Diverging an endpoint

When v1 changes `/demo`'s response shape (adds a `version: "v1"` field):

1. v1's group defines a new wire schema inline (`Schema.Struct({
...Demo.fields, version: Schema.Literal("v1") })`) and passes it to the
   factory.
2. v1's binding wraps the shared handler with a thin adapter
   (`Effect.map(demo => ({ ...demo, version: "v1" as const }))`) before
   passing it to `handle`.

The endpoint factory and handler stay shared. Only the version-local
files change.

When the adapter would be more than a field-level decoration, prefer a
`Schema.transform` codec on the version's wire schema. That keeps the
binding files thin and the encoding logic next to the schema.

## Adding an endpoint that didn't exist in earlier versions

When v1 adds `/demo/preferences`:

1. New factory in `endpoints.ts` (e.g. `getPreferencesEndpoint`).
2. New handler in `handlers.ts` (e.g. `getPreferences`).
3. v1's group adds the endpoint via the factory. v0's group doesn't touch it.
4. v1's binding adds the handler via `handle`. v0's binding doesn't touch it.

The factory and handler files exist once at the domain level. Only versions
that include the endpoint reference them.

## Removing an endpoint in a later version

When v2 drops an endpoint v1 had:

1. v2's group simply doesn't `.add(...)` the factory.
2. v2's binding simply doesn't `.handle(...)` the handler.

The factory and handler stay in their domain-level files (still used by
v1, which is still alive). They get deleted only when no remaining
version references them — typically when the version that introduced the
endpoint is dropped.

## Lifecycle: dropping v0

When v0 hits end-of-life:

1. Delete `src/domain/demo/v0.ts`.
2. Delete `src/http/v0.ts`.
3. Remove the `v0` import + arg from `src/http/index.ts`.
4. Run `tsc --noEmit` to find any endpoint factories or handlers that no
   longer have callers; delete those.
5. Update `package.json` `apiVersions` to reflect the new lifecycle stage.

The version's bookkeeping is genuinely local to its files. There's no
`if (version === 'v0')` branching to clean up because the structure
forbids it.

## File count comparison

For a single domain with two versions, where v1 introduces both schema
divergence and a new endpoint:

| File category               | Original | First restructure | Lean  |
| --------------------------- | -------- | ----------------- | ----- |
| Domain (model, service)     | 2        | 2                 | 2     |
| Endpoint factories          | 0        | 2                 | 1     |
| Handlers                    | 1        | 2                 | 1     |
| Schemas                     | 0        | 2                 | 0     |
| Per-version groups          | 1        | 2                 | 2     |
| Per-version handler binding | 1        | 2                 | 0\*   |
| Per-version http top-level  | 2        | 4                 | 2     |
| Top-level http              | 1        | 1                 | 1     |
| **Total API files**         | **8**    | **17**            | **9** |

_\*Folded into the per-version http top-level file._

The lean version is a single file larger than the original (which had no
v1) while supporting a fully diverged v1 cleanly. The first restructure
nearly doubled the file count by splitting things that didn't need
splitting yet.

## When to split further

The lean structure is the floor. Reasons to split a file out:

- An `endpoints.ts` exceeds ~150 lines → split per-endpoint.
- A `handlers.ts` exceeds ~150 lines or has many helper utilities → split
  per-endpoint or extract a `helpers.ts`.
- A version's `vN.ts` group file grows past ~60 lines because the schemas
  inline are large → extract `schemas/vN.ts`.
- An `http/vN.ts` becomes hard to navigate because there are many domain
  bindings → split per-domain binding files (but keep the API + layer
  in `vN.ts`).

These are the splits with concrete justification. Don't split on
principle; split when the file actually demands it.
