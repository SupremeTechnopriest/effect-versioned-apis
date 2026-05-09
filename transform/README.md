# Transform (Schema Derivation) Versioned API Layout

This project demonstrates a **schema transform** approach to API versioning with Effect's `HttpApi`. Older version wire shapes are defined alongside bidirectional transforms that map to/from the canonical type. The handler always works with the canonical type; the schema layer handles wire conversion automatically.

## Layout

```
src/
  domain/todo/
    model.ts        # canonical Todo type -- the latest, richest shape
    service.ts      # business logic -- version-agnostic
    wire.ts         # versioned wire schemas + transforms to/from canonical
    endpoints.ts    # endpoint factories (parameterized by schema)
    handlers.ts     # handler functions -- always work with canonical types
  domain/user/
    model.ts        # User schema
    service.ts      # UserService
    endpoints.ts    # identity endpoint
    handlers.ts     # getIdentity
    group.ts        # single UserGroup (carried forward)
  http/
    index.ts        # Layer.mergeAll(v0, v1, v2)
    v0.ts           # group + bindings using wire.v0
    v1.ts           # group + bindings using wire.v1
    v2.ts           # group + bindings using wire.v2
  middleware/
    auth.ts         # bearer token -> CurrentUser
  layers/
    http.ts
    log.ts
  index.ts
```

## The Core Idea

Instead of manually projecting responses at the handler binding site:

```typescript
// lean approach -- handler returns full Todo, binding manually projects
.handle("create", ({ payload }) =>
  createTodo(payload).pipe(Effect.map(({ id, userId, title }) => ({ id, userId, title }))),
)
```

...the schema transform handles it automatically:

```typescript
// transform approach -- handler returns full Todo, schema converts for wire
.handle("create", ({ payload }) => createTodo(payload))
```

The version-specific wire shape and its mapping to/from the canonical type live in `wire.ts`:

```typescript
export const v0 = {
  createPayload: WirePayloadV0.pipe(
    Schema.decodeTo(CanonicalPayload, {
      decode: SchemaGetter.transform((wire) => ({
        title: wire.title,
        done: false,
        priority: 0,
      })),
      encode: SchemaGetter.transform((canonical) => ({
        title: canonical.title,
      })),
    }),
  ),
  createResponse: WireResponseV0.pipe(
    Schema.decodeTo(Todo, {
      decode: SchemaGetter.transform((wire) => ({
        id: wire.id, userId: wire.userId, title: wire.title,
        done: false, priority: 0,
      })),
      encode: SchemaGetter.transform((todo) => ({
        id: todo.id, userId: todo.userId, title: todo.title,
      })),
    }),
  ),
} as const;
```

## Design Principles

- **Handlers are version-unaware.** They always receive and return the canonical type. No `Effect.map` projections at binding sites.
- **Wire shapes are explicit.** Each version's wire schema is defined as a concrete struct -- you can read exactly what goes over the wire.
- **Transforms are colocated.** The mapping between wire and canonical lives right next to the wire definition. No hunting through binding code to understand what's projected.
- **Reach for this first.** Schema transforms handle linear, additive evolution. Only escalate to lean/explicit/registry when changes are structural.

## Version Divergence

The create endpoint diverges across versions:
- **v0**: wire `{title}` → canonical `{title, done: false, priority: 0}`; response projects `{id, userId, title}`
- **v1**: wire `{title, done}` → canonical `{title, done, priority: 0}`; response projects `{id, userId, title, done}`
- **v2**: canonical directly -- no transform needed

All divergence is expressed as transforms in `wire.ts`. The handler bindings in `http/v*.ts` are identical across all three versions.

## Lifecycle: Adding a Field to Todo

1. Add the field to `model.ts` (canonical type).
2. Update `wire.ts` transforms: older versions get a default value in the decode path and omit it in the encode path.
3. Handler and bindings don't change.

## When to Escalate

Schema transforms work well for:
- Adding fields (older versions fill defaults)
- Narrowing responses (older versions project fewer fields)
- Changing defaults (modify transform logic, not handler)

They do **not** work well for:
- Renaming fields where old name must remain on the wire (transform works but becomes confusing at scale)
- Reshaping nested objects (e.g. flattening `address.city` → `city`)
- Splitting a resource into two separate endpoints
- Removing an endpoint entirely from a version

At that point, reach for lean, explicit, or registry which give you full control over the version's group composition.

## Tradeoffs

**Strengths:**
- Handler bindings are version-agnostic -- identical across all versions, no manual projections.
- Wire shapes are explicit structs -- you can read exactly what each version sends/receives.
- Transforms are colocated with wire definitions -- the full version contract is in one place.
- Adding a version is mechanical: define wire schema, write transform, done.

**Friction (cognitive overhead):**
- **Derived types are opaque in IDE tooltips.** Hovering a `Schema.decodeTo(...)` result shows the transform chain, not the resolved struct. You must look at the wire schema definition to understand what goes over the wire.
- **Only works for small, linear changes.** Schema transforms handle additive field evolution well, but larger structural changes (reshaping nested objects, splitting resources) produce transform functions that are harder to reason about than just defining a separate group. At that point, escalate to one of the other patterns.
- **Refactoring the canonical type has blast radius.** Renaming or removing a field in `Todo` breaks all transform functions that reference it. The errors are immediate and numerous -- every version's transform surfaces the issue simultaneously.
