import { Schema } from "effect";
import { HttpApiGroup, OpenApi } from "effect/unstable/httpapi";

import { Auth } from "@/middleware/auth";
import { Todo } from "./model";
import { listEndpoint, getEndpoint, createEndpoint, deleteEndpoint } from "./endpoints";

const CreatePayload = Schema.Struct({
  title: Schema.String,
  done: Schema.Boolean,
  priority: Schema.Int,
});
const CreateResponse = Todo;

export const TodoGroupV2 = HttpApiGroup.make("todos")
  .add(listEndpoint(Todo))
  .add(getEndpoint(Todo))
  .add(createEndpoint(CreatePayload, CreateResponse))
  .add(deleteEndpoint)
  .middleware(Auth)
  .annotate(OpenApi.Title, "Todos")
  .annotate(OpenApi.Description, "Todo CRUD endpoints.");
