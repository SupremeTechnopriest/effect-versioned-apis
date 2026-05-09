import { Effect } from "effect";
import { CurrentUser } from "@/middleware/auth";
import { TodoService } from "./service";
import { Todo } from "./model";

export const listTodos = () =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const svc = yield* TodoService;
    return yield* svc.list(user.id);
  }).pipe(Effect.provide(TodoService.Live));

export const getTodo = ({ params }: { readonly params: { readonly id: string } }) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const svc = yield* TodoService;
    const todo = yield* svc.get(user.id, params.id);
    if (!todo) return yield* Effect.die(new Error("Not found"));
    return todo;
  }).pipe(Effect.provide(TodoService.Live));

export const createTodo = (payload: { readonly title: string; readonly done?: boolean; readonly priority?: number }) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const svc = yield* TodoService;
    const todo = Todo.make({
      id: crypto.randomUUID(),
      userId: user.id,
      title: payload.title,
      done: payload.done ?? false,
      priority: payload.priority ?? 0,
    });
    return yield* svc.create(todo);
  }).pipe(Effect.provide(TodoService.Live));

export const deleteTodo = ({ params }: { readonly params: { readonly id: string } }) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const svc = yield* TodoService;
    const deleted = yield* svc.remove(user.id, params.id);
    return { deleted };
  }).pipe(Effect.provide(TodoService.Live));
