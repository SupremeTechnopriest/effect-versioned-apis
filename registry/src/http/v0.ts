import { Effect, Layer } from "effect";
import { HttpApi, HttpApiBuilder, OpenApi } from "effect/unstable/httpapi";

import { todoVersions } from "@/domain/todo";
import { listTodos, getTodo, createTodo, deleteTodo } from "@/domain/todo/handlers";
import { userVersions } from "@/domain/user";
import { getIdentity } from "@/domain/user/handlers";
import { AuthLive } from "@/middleware/auth";

export const api = HttpApi.make("v0")
  .add(todoVersions.v0)
  .add(userVersions.v0)
  .annotate(OpenApi.Title, "v0")
  .annotate(OpenApi.Description, "API Version 0")
  .annotate(OpenApi.Version, "v0")
  .prefix("/v0");

const TodosLive = HttpApiBuilder.group(api, "todos", (handlers) =>
  Effect.sync(() =>
    handlers
      .handle("list", listTodos)
      .handle("get", getTodo)
      .handle("create", ({ payload }) =>
        createTodo(payload).pipe(Effect.map(({ id, userId, title }) => ({ id, userId, title }))),
      )
      .handle("delete", deleteTodo),
  ),
);

const UserLive = HttpApiBuilder.group(api, "user", (handlers) =>
  Effect.sync(() => handlers.handle("identity", getIdentity)),
);

export const layer = Layer.mergeAll(TodosLive, UserLive).pipe(Layer.provide(AuthLive));
