import { HttpApiEndpoint, OpenApi } from "effect/unstable/httpapi";
import { User } from "@/domain/user/model";

export const identityEndpoint = HttpApiEndpoint.get("identity", "/identity", {
  success: User,
}).annotateMerge(
  OpenApi.annotations({ title: "Identity", description: "Returns the currently authenticated user." }),
);
