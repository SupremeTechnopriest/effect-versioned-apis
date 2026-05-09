import { Layer } from "effect";

import { HttpTodoV1Live } from "@/domain/todo/http/v1";
import { HttpUserV0Live } from "@/domain/user/http/v0";
import { AuthLive } from "@/middleware/auth";

export const v1Layer = Layer.mergeAll(HttpTodoV1Live, HttpUserV0Live).pipe(Layer.provide(AuthLive));
