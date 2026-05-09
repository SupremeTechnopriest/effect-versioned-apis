import { BunHttpServer } from "@effect/platform-bun";
import { Config, Effect, Layer } from "effect";
import { HttpMiddleware, HttpRouter } from "effect/unstable/http";

export const makeHttpLayer = <A, E, R>(ApiLive: Layer.Layer<A, E, R>) =>
  Effect.gen(function* () {
    const PORT = yield* Config.port("PORT").pipe(Config.withDefault(3001));

    return HttpRouter.serve(Layer.mergeAll(ApiLive), {
      middleware: HttpMiddleware.cors(),
    }).pipe(Layer.provide(BunHttpServer.layer({ port: PORT })));
  }).pipe(Layer.unwrap);
