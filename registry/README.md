# Registry Versioned API Layout

This project demonstrates the **registry pattern** for API versioning with Effect's `HttpApi`. A central registry in each domain maps active API versions to their group implementations, making carry-forward cheap and version lifecycle visible in one place.

## Layout

```
src/
  domain/todo/
    model.ts          # canonical types
    service.ts        # business logic
    endpoints.ts      # endpoint factories
    handlers.ts       # handler functions
    baseline.ts       # group used by versions where todo hasn't diverged (v0)
    v1.ts             # group introduced in v1
    v2.ts             # group introduced in v2
    index.ts          # registry: { v0: baseline, v1: v1, v2: v2 }
  http/
    index.ts          # Layer.mergeAll(v0, v1, v2)
    v0.ts             # top-level API + handler bindings + layer
    v1.ts
    v2.ts
  middleware/
    auth.ts           # bearer token -> CurrentUser
  layers/
    http.ts
    log.ts
  index.ts
```

## How the Registry Works

Each domain's `index.ts` exports a `versions` object literal:

```typescript
export const todoVersions = {
  v0: TodoGroupBaseline,
  v1: TodoGroupV1,
  v2: TodoGroupV2,
} as const;
```

Each per-version `http/v{N}.ts` imports from the registry:

```typescript
export const api = HttpApi.make("v2").add(todoVersions.v2).prefix("/v2");
```

## Design Principles

- **Cheap carry-forward**: a domain that doesn't change in a new version gets a one-line registry entry pointing at the existing group.
- **Safe deletion**: dropping a deprecated version is a mechanical edit to the registry plus deleting the version's http file.
- **Single-file lifecycle visibility**: each domain's `index.ts` shows the entire mapping of active versions to group implementations.

## Version Divergence

The create endpoint diverges across versions:

- **v0** (baseline): `{title}` -> `{id, userId, title}`
- **v1**: `{title, done}` -> `{id, userId, title, done}`
- **v2**: `{title, done, priority}` -> full Todo

When a domain carries forward unchanged, the registry just points at the same group. When it diverges, a new group file is created and the registry entry is updated.

## Lifecycle: Bumping a Version

To add v3 where todo carries forward from v2:

1. Add `v3: TodoGroupV2` to the registry (one line).
2. Create `http/v3.ts` (copy from v2, update version literals).
3. Add v3 to `http/index.ts`.

If todo actually diverges in v3, create `domain/todo/v3.ts` with the new group and point the registry entry at it instead.

## Lifecycle: Dropping v0

1. Remove the `v0:` entry from `src/domain/todo/index.ts`.
2. Delete `src/http/v0.ts`.
3. Remove from `src/http/index.ts`.
4. If `baseline.ts` is no longer referenced by any remaining version, delete it.

In production, you'd automate steps 1-4 with a `drop` script. The type-checker catches anything the script misses.

## Tradeoffs

**Strengths:**

- Per-bump churn is proportional to actual divergence, not total domain count. A version bump that touches 1 of 10 domains creates 1 new group file, not 10.
- The registry gives full lifecycle visibility in one file per domain.
- Carry-forward is explicit and free (one line).
- The pattern scales well for many domains with a rolling deprecation window.

**Friction:**

- **Indirection as cognitive load.** The relationship between "what a version exposes" (the registry entry) and "how it's served" (the http binding) is indirect. You must hold two separate locations in mind and mentally connect them -- neither file tells the full story alone.
- **Baseline ambiguity.** "Baseline" can mean the initial shape or the unchanged carry-forward group. When multiple divergence points exist across a domain's history, interpreting which baseline applies requires context that isn't in the filename.
- **Pattern knowledge prerequisite.** The registry concept itself must be learned before any code makes sense. Unlike the [explicit](../explicit/) approach (where file-system structure is self-documenting) or the [lean](../lean/) approach (where everything is in one place), the registry pattern offers no affordance to a developer who hasn't been taught it.
