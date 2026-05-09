import { HttpApi, OpenApi } from "effect/unstable/httpapi";

import { TodoGroupV2 } from "@/domain/todo/groups/v2";
import { UserGroup } from "@/domain/user/groups/user";

export const v2 = HttpApi.make("v2")
  .add(TodoGroupV2)
  .add(UserGroup)
  .annotate(OpenApi.Title, "v2")
  .annotate(OpenApi.Description, "API Version 2")
  .annotate(OpenApi.Version, "v2")
  .prefix("/v2");
