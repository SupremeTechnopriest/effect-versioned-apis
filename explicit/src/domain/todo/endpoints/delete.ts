import { Schema } from "effect";
import { HttpApiEndpoint, OpenApi } from "effect/unstable/httpapi";

export const deleteEndpoint = HttpApiEndpoint.make("DELETE")("delete", "/todos/:id", {
  params: { id: Schema.String },
  success: Schema.Struct({ deleted: Schema.Boolean }),
}).annotateMerge(
  OpenApi.annotations({ title: "Delete Todo", description: "Delete a todo by id." }),
);
