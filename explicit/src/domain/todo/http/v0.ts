import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { v0 } from "@/http/versions/v0/api";
import { listTodos } from "@/domain/todo/handlers/list";
import { getTodo } from "@/domain/todo/handlers/get";
import { createTodo } from "@/domain/todo/handlers/create";
import { deleteTodo } from "@/domain/todo/handlers/delete";

export const HttpTodoV0Live = HttpApiBuilder.group(v0, "todos", (handlers) =>
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
