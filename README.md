# Versioned APIs with Effect

Four approaches to API versioning using Effect's `HttpApi` module (`effect/unstable/httpapi`). Each project implements the same TODO CRUD API with bearer-token auth across three versions (v0, v1, v2), differing only in how versioned code is organized.

## The API

All four projects expose identical behavior:

| Endpoint | v0 | v1 | v2 |
|---|---|---|---|
| `GET /todos` | full Todo | full Todo | full Todo |
| `GET /todos/:id` | full Todo | full Todo | full Todo |
| `POST /todos` | body: `{title}` / resp: `{id, userId, title}` | body: `{title, done}` / resp: `{id, userId, title, done}` | body: `{title, done, priority}` / resp: full Todo |
| `DELETE /todos/:id` | `{deleted: bool}` | `{deleted: bool}` | `{deleted: bool}` |

Auth: `Authorization: Bearer <token>` where the token value is used directly as the userId.

## The Four Approaches

| | **transform/** | **lean/** | **explicit/** | **registry/** |
|---|---|---|---|---|
| Philosophy | Schema transforms map older wire shapes to/from canonical; handlers stay version-unaware | Minimize file count; inline divergent schemas | One file per concern; maximum physical separation | Central registry maps versions to group implementations |
| Files per version bump | Add wire schema + transform in `wire.ts` | 1 group + 1 http (per domain) | ~4 domain files + 2 http files | 1 group + 1 http + 1 registry line |
| Dropping a version | Remove transform from `wire.ts` | Delete 2 files, remove 1 import | Delete ~6 files across 3 dirs | Delete 2 files, remove 1 registry entry |
| Cognitive overhead | Low; wire shapes and transforms colocated, but opaque in IDE tooltips | Low entry cost; grows as domains accumulate in single files | High entry cost (large file map); low per-file reasoning once internalized | Medium entry cost (indirection); lowest ongoing cost at scale |
| Best for | Linear, additive field evolution -- reach for this first | Small teams, few domains, fast iteration | Large teams, strict code ownership, IDE-heavy workflows | Many domains with rolling deprecation windows |

> **Start with transform.** Schema transforms handle additive changes cheaply -- handlers stay version-unaware. Escalate to lean/explicit/registry when the change is structural (renames, reshapes, endpoint splits).

## Running

Each project is a standalone Bun app:

```bash
cd transform/   # or lean/ or explicit/ or registry/
bun install
bun dev     # starts on port 3001
```

## Project READMEs

- [transform/README.md](transform/README.md) -- schema derivation with tradeoffs
- [lean/README.md](lean/README.md) -- lean layout with tradeoffs
- [explicit/README.md](explicit/README.md) -- explicit layout with tradeoffs
- [registry/README.md](registry/README.md) -- registry pattern with tradeoffs
