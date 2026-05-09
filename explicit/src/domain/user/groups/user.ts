import { HttpApiGroup, OpenApi } from "effect/unstable/httpapi";

import { Auth } from "@/middleware/auth";
import { identityEndpoint } from "@/domain/user/endpoints/identity";

export const UserGroup = HttpApiGroup.make("user")
  .add(identityEndpoint)
  .middleware(Auth)
  .annotate(OpenApi.Title, "User")
  .annotate(OpenApi.Description, "User identity endpoint.");
