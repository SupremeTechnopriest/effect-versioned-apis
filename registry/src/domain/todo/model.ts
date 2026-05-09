import { Schema } from "effect";

export const Todo = Schema.Struct({
  id: Schema.String,
  userId: Schema.String,
  title: Schema.String,
  done: Schema.Boolean,
  priority: Schema.Int,
});

export type Todo = typeof Todo.Type;
