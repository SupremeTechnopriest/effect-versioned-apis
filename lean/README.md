# Lean Versioned API Layout

This project demonstrates a **minimal-file-count** approach to API versioning with Effect's `HttpApi`. The TODO CRUD API is implemented across v0, v1, and v2 with the fewest possible files while maintaining zero code duplication.

## Layout

```
src/
  domain/todo/
    model.ts        # canonical Todo type -- version-agnostic
    service.ts      # business logic -- version-agnostic
    endpoints.ts    # all endpoint factories for this domain
    handlers.ts     # all handler functions for this domain
    v0.ts           # v0 group (which endpoints + which schemas)
    v1.ts           # v1 group
    v2.ts           # v2 group
  http/
    index.ts        # Layer.mergeAll(v0, v1, v2)
    v0.ts           # top-level HttpApi + handler bindings + layer for v0
    v1.ts           # same for v1
    v2.ts           # same for v2
  middleware/
    auth.ts         # bearer token -> CurrentUser
  layers/
    http.ts
    log.ts
  index.ts
```

## Design Principles

- **One copy of every piece of logic.** No duplication across versions.
- **File granularity matches cognitive boundaries.** Don't split preemptively.
- **Cutting a new version** is small, mechanical, and additive: one group file + one http file.
- **Dropping a deprecated version** is a two-file delete plus one import removal.

## What Each File Does

### Version-agnostic (one copy, forever)

**`domain/todo/model.ts`** -- canonical domain shape. No wire concerns.

**`domain/todo/service.ts`** -- business logic. Speaks only in canonical types.

**`domain/todo/endpoints.ts`** -- endpoint factories parameterized by schemas. Each factory holds path, method, and OpenAPI metadata; schemas vary per version.

**`domain/todo/handlers.ts`** -- handler functions. Plain functions from request to effect. Type-checked at the binding site against the version's endpoint shape.

### Per-version (one file per version per domain)

**`domain/todo/v{N}.ts`** -- defines the version's group. Picks which endpoints exist and supplies their schemas. Divergent schemas live inline here. Lift them into a separate file only when they grow large or get reused.

### Per-version (one file per version, top-level)

**`http/v{N}.ts`** -- three things in one file:

1. The version's top-level `HttpApi` (mounts groups, applies prefix).
2. Handler bindings (`HttpApiBuilder.group` calls).
3. The merged layer with middleware.

These three things are tightly coupled so splitting them just creates files that always change together.

## Version Divergence

The create endpoint diverges across versions:

- **v0**: `{title}` -> `{id, userId, title}`
- **v1**: `{title, done}` -> `{id, userId, title, done}`
- **v2**: `{title, done, priority}` -> full Todo

List, get, and delete are unchanged across all versions (always return the full canonical shape). The shared handlers are reused directly; the create handler is wrapped with `Effect.map` at the binding site to project the response down to the version's wire shape.

## Lifecycle: Dropping v0

1. Delete `src/domain/todo/v0.ts`.
2. Delete `src/http/v0.ts`.
3. Remove the `v0` import from `src/http/index.ts`.
4. Run `tsc --noEmit` to find dead endpoint factories or handlers; delete those.

## When to Split Further

- `endpoints.ts` exceeds ~150 lines -> split per-endpoint.
- `handlers.ts` exceeds ~150 lines -> split per-handler.
- A `v{N}.ts` group grows past ~60 lines -> extract `schemas/v{N}.ts`.
- `http/v{N}.ts` has too many domain bindings -> split per-domain.

## Tradeoffs

**Strengths:**

- Fast to scan -- few files, low indirection.
- Adding a new endpoint is 2 changes (factory + handler), not 4+.
- The combined `http/v{N}.ts` keeps tightly-coupled pieces together.

**Friction:**

- **Low file count hides coupling.** A single `http/v*.ts` bundles the API shape, handler bindings, and middleware wiring. You hold three concerns in working memory simultaneously, and a change to any one requires re-reading the others.
- **Inline schemas blur boundaries.** Version-specific wire shapes live inside the group file alongside group composition logic. Reasoning about "what does the wire look like?" and "how is the group assembled?" requires parsing both at once rather than navigating to a dedicated location.
- **Scanning cost grows linearly with domains.** Each domain adds a binding block to the version file. With many domains, reading or modifying a single version means mentally skipping over unrelated binding blocks to find the one you care about.
