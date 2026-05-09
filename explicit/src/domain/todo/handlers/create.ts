import { Effect } from "effect";
import { CurrentUser } from "@/middleware/auth";
import { TodoService } from "@/domain/todo/service";
import { Todo } from "@/domain/todo/model";

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
