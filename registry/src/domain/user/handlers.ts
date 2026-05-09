import { Effect } from "effect";
import { CurrentUser } from "@/middleware/auth";

export const getIdentity = () =>
  Effect.gen(function* () {
    return yield* CurrentUser;
  });
