import { Effect, Layer } from "effect";
import { HttpApi, HttpApiBuilder, OpenApi } from "effect/unstable/httpapi";

import { todoVersions } from "@/domain/todo";
import { listTodos, getTodo, createTodo, deleteTodo } from "@/domain/todo/handlers";
import { userVersions } from "@/domain/user";
import { getIdentity } from "@/domain/user/handlers";
import { AuthLive } from "@/middleware/auth";

export const api = HttpApi.make("v1")
  .add(todoVersions.v1)
  .add(userVersions.v1)
  .annotate(OpenApi.Title, "v1")
  .annotate(OpenApi.Description, "API Version 1")
  .annotate(OpenApi.Version, "v1")
  .prefix("/v1");

const TodosLive = HttpApiBuilder.group(api, "todos", (handlers) =>
  Effect.sync(() =>
    handlers
      .handle("list", listTodos)
      .handle("get", getTodo)
      .handle("create", ({ payload }) =>
        createTodo(payload).pipe(Effect.map(({ id, userId, title, done }) => ({ id, userId, title, done }))),
      )
      .handle("delete", deleteTodo),
  ),
);

const UserLive = HttpApiBuilder.group(api, "user", (handlers) =>
  Effect.sync(() => handlers.handle("identity", getIdentity)),
);

export const layer = Layer.mergeAll(TodosLive, UserLive).pipe(Layer.provide(AuthLive));
