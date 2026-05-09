import { Effect, Schema, Layer, Redacted, Context } from "effect";
import { HttpApiMiddleware, HttpApiSecurity, OpenApi } from "effect/unstable/httpapi";
import type { User } from "@/domain/user/model";
import { UserService } from "@/domain/user/service";

export class CurrentUser extends Context.Service<CurrentUser, User>()("@/CurrentUser") {}

export class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  {},
  { httpApiStatus: 401 },
) {}

export class Auth extends HttpApiMiddleware.Service<
  Auth,
  { provides: CurrentUser }
>()("Auth", {
  error: Unauthorized,
  security: {
    bearer: HttpApiSecurity.bearer.pipe(
      HttpApiSecurity.annotate(OpenApi.Description, "Bearer token (value is treated as userId)"),
    ),
  },
}) {}

export const AuthLive = Layer.effect(
  Auth,
  Effect.succeed({
    bearer: (effect, { credential }) =>
      Effect.gen(function* () {
        const svc = yield* UserService;
        const user = yield* svc.findById(Redacted.value(credential));
        if (!user) return yield* Effect.fail(new Unauthorized());
        return yield* effect.pipe(Effect.provideService(CurrentUser, user));
      }).pipe(Effect.provide(UserService.Live)),
  }),
);
