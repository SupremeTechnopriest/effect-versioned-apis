import { Schema } from "effect";
import { HttpApiEndpoint, OpenApi } from "effect/unstable/httpapi";

export const listEndpoint = <S extends Schema.Top>(success: S) =>
  HttpApiEndpoint.get("list", "/todos", { success: Schema.Array(success) }).annotateMerge(
    OpenApi.annotations({ title: "List Todos", description: "List all todos for the authenticated user." }),
  );
