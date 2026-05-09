import { TodoGroupBaseline } from "./baseline";
import { TodoGroupV1 } from "./v1";
import { TodoGroupV2 } from "./v2";

export const todoVersions = {
  v0: TodoGroupBaseline,
  v1: TodoGroupV1,
  v2: TodoGroupV2,
} as const;
