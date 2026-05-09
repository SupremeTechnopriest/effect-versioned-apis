import { Schema } from "effect";
import { HttpApiEndpoint, OpenApi } from "effect/unstable/httpapi";

export const listEndpoint = <S extends Schema.Top>(success: S) =>
  HttpApiEndpoint.get("list", "/todos", { success: Schema.Array(success) }).annotateMerge(
    OpenApi.annotations({ title: "List Todos", description: "List all todos for the authenticated user." }),
  );

export const getEndpoint = <S extends Schema.Top>(success: S) =>
  HttpApiEndpoint.get("get", "/todos/:id", {
    success,
    params: { id: Schema.String },
  }).annotateMerge(
    OpenApi.annotations({ title: "Get Todo", description: "Get a single todo by id." }),
  );

export const createEndpoint = <P extends Schema.Top, S extends Schema.Top>(payload: P, success: S) =>
  HttpApiEndpoint.post("create", "/todos", {
    payload,
    success,
  }).annotateMerge(
    OpenApi.annotations({ title: "Create Todo", description: "Create a new todo." }),
  );

export const deleteEndpoint = HttpApiEndpoint.make("DELETE")("delete", "/todos/:id", {
  params: { id: Schema.String },
  success: Schema.Struct({ deleted: Schema.Boolean }),
}).annotateMerge(
  OpenApi.annotations({ title: "Delete Todo", description: "Delete a todo by id." }),
);
