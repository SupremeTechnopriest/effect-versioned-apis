import { Effect } from "effect";
import { CurrentUser } from "@/middleware/auth";
import { TodoService } from "@/domain/todo/service";

export const getTodo = ({ params }: { readonly params: { readonly id: string } }) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const svc = yield* TodoService;
    const todo = yield* svc.get(user.id, params.id);
    if (!todo) return yield* Effect.die(new Error("Not found"));
    return todo;
  }).pipe(Effect.provide(TodoService.Live));
