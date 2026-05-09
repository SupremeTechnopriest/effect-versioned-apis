import { Schema } from "effect";

export const CreatePayload = Schema.Struct({
  title: Schema.String,
  done: Schema.Boolean,
  priority: Schema.Int,
});

export { Todo as CreateResponse } from "@/domain/todo/model";
