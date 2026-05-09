import { Effect, Layer, Context, Ref } from "effect";
import type { Todo } from "./model";

export interface TodoStore {
  list(userId: string): Effect.Effect<Todo[]>;
  get(userId: string, id: string): Effect.Effect<Todo | undefined>;
  create(todo: Todo): Effect.Effect<Todo>;
  remove(userId: string, id: string): Effect.Effect<boolean>;
}

const make = Effect.gen(function* () {
  const store = yield* Ref.make<Todo[]>([]);

  const list = (userId: string) =>
    Ref.get(store).pipe(Effect.map((todos) => todos.filter((t) => t.userId === userId)));

  const get = (userId: string, id: string) =>
    Ref.get(store).pipe(Effect.map((todos) => todos.find((t) => t.id === id && t.userId === userId)));

  const create = (todo: Todo) =>
    Ref.update(store, (todos) => [...todos, todo]).pipe(Effect.map(() => todo));

  const remove = (userId: string, id: string) =>
    Ref.get(store).pipe(
      Effect.flatMap((todos) => {
        const idx = todos.findIndex((t) => t.id === id && t.userId === userId);
        if (idx === -1) return Effect.succeed(false);
        return Ref.set(store, [...todos.slice(0, idx), ...todos.slice(idx + 1)]).pipe(
          Effect.map(() => true),
        );
      }),
    );

  return { list, get, create, remove } as const;
});

export class TodoService extends Context.Service<TodoService>()("@/Todo/Service", { make }) {
  static Live = Layer.effect(TodoService, TodoService.make);
}
