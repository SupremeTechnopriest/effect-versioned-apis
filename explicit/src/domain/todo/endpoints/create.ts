import { Schema } from "effect";
import { HttpApiEndpoint, OpenApi } from "effect/unstable/httpapi";

export const createEndpoint = <P extends Schema.Top, S extends Schema.Top>(payload: P, success: S) =>
  HttpApiEndpoint.post("create", "/todos", {
    payload,
    success,
  }).annotateMerge(
    OpenApi.annotations({ title: "Create Todo", description: "Create a new todo." }),
  );
