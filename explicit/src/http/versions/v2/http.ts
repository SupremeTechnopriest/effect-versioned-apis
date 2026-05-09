import { Layer } from "effect";

import { HttpTodoV2Live } from "@/domain/todo/http/v2";
import { HttpUserV0Live } from "@/domain/user/http/v0";
import { AuthLive } from "@/middleware/auth";

export const v2Layer = Layer.mergeAll(HttpTodoV2Live, HttpUserV0Live).pipe(Layer.provide(AuthLive));
