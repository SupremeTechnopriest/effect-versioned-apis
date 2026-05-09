# Explicit Versioned API Layout

This project demonstrates a **maximally explicit** approach to API versioning with Effect's `HttpApi`. Every concern gets its own file: schemas, endpoint factories, handlers, groups, and HTTP bindings are all physically separated.

## Layout

```
src/
  domain/todo/
    model.ts              # canonical Todo type -- version-agnostic
    service.ts            # business logic -- version-agnostic
    schemas/
      v0.ts               # v0 wire schemas
      v1.ts               # v1 wire schemas
      v2.ts               # v2 wire schemas
    endpoints/
      list.ts             # endpoint factory: list todos
      get.ts              # endpoint factory: get todo
      create.ts           # endpoint factory: create todo
      delete.ts           # endpoint factory: delete todo
    handlers/
      list.ts             # handler: list todos
      get.ts              # handler: get todo
      create.ts           # handler: create todo
      delete.ts           # handler: delete todo
    groups/
      v0.ts               # v0 group: picks endpoints + schemas
      v1.ts               # v1 group
      v2.ts               # v2 group
    http/
      v0.ts               # binds handlers to v0 group
      v1.ts               # binds handlers to v1 group
      v2.ts               # binds handlers to v2 group
  http/
    index.ts              # mounts all active versions
    versions/
      v0/
        api.ts            # top-level v0 HttpApi (mounts groups, prefix)
        http.ts           # v0 layer: binding layers + middleware
      v1/
        api.ts
        http.ts
      v2/
        api.ts
        http.ts
  middleware/
    auth.ts               # bearer token -> CurrentUser
  layers/
    http.ts
    log.ts
  index.ts
```

## Design Principles

- **One copy of every piece of logic.** No duplication across versions.
- **Clear physical separation** between things that change with a version (wire schemas, group composition, handler bindings) and things that don't (domain logic, services, middleware).
- **Cutting a new version** is small, mechanical, and additive.
- **Dropping a deprecated version** is a directory delete plus one import line.

## The Four Kinds of Files

### Version-agnostic (one copy, forever)

- `model.ts` -- canonical domain shape. No wire concerns.
- `service.ts` -- business logic. Speaks in domain types.
- `endpoints/<name>.ts` -- endpoint factory parameterized by schemas.
- `handlers/<name>.ts` -- plain function from request to effect.

### Per-version (one file per version)

- `schemas/v{N}.ts` -- wire schemas for that version. Re-export from model when unchanged.
- `groups/v{N}.ts` -- selects which endpoints exist and which schemas they use.
- `http/v{N}.ts` -- binds handlers to that version's group.
- `http/versions/v{N}/api.ts` -- top-level HttpApi for that version.
- `http/versions/v{N}/http.ts` -- version layer: binding layers + middleware.

### Top-level wiring (one file)

- `http/index.ts` -- `Layer.mergeAll(v0, v1, v2)`.

## Version Divergence

The create endpoint diverges across versions:
- **v0**: `{title}` -> `{id, userId, title}` (schemas/v0.ts)
- **v1**: `{title, done}` -> `{id, userId, title, done}` (schemas/v1.ts)
- **v2**: `{title, done, priority}` -> full Todo (schemas/v2.ts)

Each version's schema file is independently importable for codegen, contract tests, or client SDK derivation.

## Lifecycle: Dropping v0

1. Delete `src/http/versions/v0/`.
2. Delete `src/domain/todo/groups/v0.ts`, `http/v0.ts`, `schemas/v0.ts`.
3. Remove the `v0` import from `src/http/index.ts`.
4. Delete any endpoint factories or handlers no longer referenced.

## Tradeoffs

**Strengths:**
- Maximum explicitness -- every concept has a dedicated, findable file.
- IDE navigability is excellent: "Go to Definition" always lands in a focused file.
- Schemas are independently importable for tooling (codegen, contract testing, client SDKs).
- Code ownership boundaries are natural (different teams can own different files).

**Friction (cognitive overhead):**
- **Large mental map.** Understanding a single endpoint's full lifecycle -- schema, factory, handler, group, binding, api -- requires holding 5-6 file locations in working memory. The per-file simplicity is offset by the number of places you must know about.
- **High navigation tax.** Each small change (e.g. adding a field to the create payload) requires touching and reasoning about 4+ files. The cost is paid in context switches, not in per-file complexity.
- **Placeholder files add noise.** Files that exist solely for structural consistency (e.g. a schema file that re-exports the model unchanged) increase the surface area a developer must mentally track without adding information. You learn to ignore them, but that filtering itself is overhead.
