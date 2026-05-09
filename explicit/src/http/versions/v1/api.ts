import { HttpApi, OpenApi } from "effect/unstable/httpapi";

import { TodoGroupV1 } from "@/domain/todo/groups/v1";
import { UserGroup } from "@/domain/user/groups/user";

export const v1 = HttpApi.make("v1")
  .add(TodoGroupV1)
  .add(UserGroup)
  .annotate(OpenApi.Title, "v1")
  .annotate(OpenApi.Description, "API Version 1")
  .annotate(OpenApi.Version, "v1")
  .prefix("/v1");
