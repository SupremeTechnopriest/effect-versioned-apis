import { Effect, Layer } from "effect";
import { HttpApi, HttpApiBuilder, HttpApiGroup, OpenApi } from "effect/unstable/httpapi";

import { Auth, AuthLive } from "@/middleware/auth";
import { Todo } from "@/domain/todo/model";
import { v0 } from "@/domain/todo/wire";
import { listEndpoint, getEndpoint, createEndpoint, deleteEndpoint } from "@/domain/todo/endpoints";
import { listTodos, getTodo, createTodo, deleteTodo } from "@/domain/todo/handlers";
import { UserGroup } from "@/domain/user/group";
import { getIdentity } from "@/domain/user/handlers";

const TodoGroup = HttpApiGroup.make("todos")
  .add(listEndpoint(Todo))
  .add(getEndpoint(Todo))
  .add(createEndpoint(v0.createPayload, v0.createResponse))
  .add(deleteEndpoint)
  .middleware(Auth)
  .annotate(OpenApi.Title, "Todos")
  .annotate(OpenApi.Description, "Todo CRUD endpoints.");

export const api = HttpApi.make("v0")
  .add(TodoGroup)
  .add(UserGroup)
  .annotate(OpenApi.Title, "v0")
  .annotate(OpenApi.Description, "API Version 0")
  .annotate(OpenApi.Version, "v0")
  .prefix("/v0");

const TodosLive = HttpApiBuilder.group(api, "todos", (handlers) =>
  Effect.sync(() =>
    handlers
      .handle("list", listTodos)
      .handle("get", getTodo)
      .handle("create", ({ payload }) => createTodo(payload))
      .handle("delete", deleteTodo),
  ),
);

const UserLive = HttpApiBuilder.group(api, "user", (handlers) =>
  Effect.sync(() => handlers.handle("identity", getIdentity)),
);

export const layer = Layer.mergeAll(TodosLive, UserLive).pipe(Layer.provide(AuthLive));
