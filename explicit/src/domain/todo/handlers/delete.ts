import { Effect } from "effect";
import { CurrentUser } from "@/middleware/auth";
import { TodoService } from "@/domain/todo/service";

export const deleteTodo = ({ params }: { readonly params: { readonly id: string } }) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const svc = yield* TodoService;
    const deleted = yield* svc.remove(user.id, params.id);
    return { deleted };
  }).pipe(Effect.provide(TodoService.Live));
