import { HttpApiGroup, OpenApi } from "effect/unstable/httpapi";

import { Auth } from "@/middleware/auth";
import { Todo } from "@/domain/todo/model";
import { listEndpoint } from "@/domain/todo/endpoints/list";
import { getEndpoint } from "@/domain/todo/endpoints/get";
import { createEndpoint } from "@/domain/todo/endpoints/create";
import { deleteEndpoint } from "@/domain/todo/endpoints/delete";
import { CreatePayload, CreateResponse } from "@/domain/todo/schemas/v2";

export const TodoGroupV2 = HttpApiGroup.make("todos")
  .add(listEndpoint(Todo))
  .add(getEndpoint(Todo))
  .add(createEndpoint(CreatePayload, CreateResponse))
  .add(deleteEndpoint)
  .middleware(Auth)
  .annotate(OpenApi.Title, "Todos")
  .annotate(OpenApi.Description, "Todo CRUD endpoints.");
