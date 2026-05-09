import { HttpApiGroup, OpenApi } from "effect/unstable/httpapi";

import { Auth } from "@/middleware/auth";
import { identityEndpoint } from "./endpoints";

export const UserGroupBaseline = HttpApiGroup.make("user")
  .add(identityEndpoint)
  .middleware(Auth)
  .annotate(OpenApi.Title, "User")
  .annotate(OpenApi.Description, "User identity endpoint.");
