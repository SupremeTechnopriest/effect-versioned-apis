import { Layer } from "effect";

import { HttpTodoV0Live } from "@/domain/todo/http/v0";
import { HttpUserV0Live } from "@/domain/user/http/v0";
import { AuthLive } from "@/middleware/auth";

export const v0Layer = Layer.mergeAll(HttpTodoV0Live, HttpUserV0Live).pipe(Layer.provide(AuthLive));
