import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { v2 } from "@/http/versions/v2/api";
import { listTodos } from "@/domain/todo/handlers/list";
import { getTodo } from "@/domain/todo/handlers/get";
import { createTodo } from "@/domain/todo/handlers/create";
import { deleteTodo } from "@/domain/todo/handlers/delete";

export const HttpTodoV2Live = HttpApiBuilder.group(v2, "todos", (handlers) =>
  Effect.sync(() =>
    handlers
      .handle("list", listTodos)
      .handle("get", getTodo)
      .handle("create", ({ payload }) => createTodo(payload))
      .handle("delete", deleteTodo),
  ),
);
