import { Effect, Layer, Context } from "effect";
import type { User } from "./model";

const seedUsers: ReadonlyArray<User> = [
  { id: "user-1", name: "Alice" },
  { id: "user-2", name: "Bob" },
  { id: "user-3", name: "Charlie" },
];

const make = Effect.sync(() => {
  const users = new Map(seedUsers.map((u) => [u.id, u]));

  const findById = (id: string): Effect.Effect<User | undefined> =>
    Effect.succeed(users.get(id));

  return { findById } as const;
});

export class UserService extends Context.Service<UserService>()("@/User/Service", { make }) {
  static Live = Layer.effect(UserService, UserService.make);
}
