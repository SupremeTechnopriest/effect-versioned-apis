import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { v0 } from "@/http/versions/v0/api";
import { getIdentity } from "@/domain/user/handlers/identity";

export const HttpUserV0Live = HttpApiBuilder.group(v0, "user", (handlers) =>
  Effect.sync(() => handlers.handle("identity", getIdentity)),
);
