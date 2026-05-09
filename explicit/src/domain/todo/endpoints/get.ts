import { Schema } from "effect";
import { HttpApiEndpoint, OpenApi } from "effect/unstable/httpapi";

export const getEndpoint = <S extends Schema.Top>(success: S) =>
  HttpApiEndpoint.get("get", "/todos/:id", {
    success,
    params: { id: Schema.String },
  }).annotateMerge(
    OpenApi.annotations({ title: "Get Todo", description: "Get a single todo by id." }),
  );
