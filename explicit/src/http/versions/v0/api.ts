import { HttpApi, OpenApi } from "effect/unstable/httpapi";

import { TodoGroupV0 } from "@/domain/todo/groups/v0";
import { UserGroup } from "@/domain/user/groups/user";

export const v0 = HttpApi.make("v0")
  .add(TodoGroupV0)
  .add(UserGroup)
  .annotate(OpenApi.Title, "v0")
  .annotate(OpenApi.Description, "API Version 0")
  .annotate(OpenApi.Version, "v0")
  .prefix("/v0");
