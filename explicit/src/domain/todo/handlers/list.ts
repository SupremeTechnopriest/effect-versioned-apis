import { Effect } from "effect";
import { CurrentUser } from "@/middleware/auth";
import { TodoService } from "@/domain/todo/service";

export const listTodos = () =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const svc = yield* TodoService;
    return yield* svc.list(user.id);
  }).pipe(Effect.provide(TodoService.Live));
