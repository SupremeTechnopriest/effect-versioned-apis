import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { v1 } from "@/http/versions/v1/api";
import { listTodos } from "@/domain/todo/handlers/list";
import { getTodo } from "@/domain/todo/handlers/get";
import { createTodo } from "@/domain/todo/handlers/create";
import { deleteTodo } from "@/domain/todo/handlers/delete";

export const HttpTodoV1Live = HttpApiBuilder.group(v1, "todos", (handlers) =>
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
