import { Schema } from "effect";

export const CreatePayload = Schema.Struct({ title: Schema.String });

export const CreateResponse = Schema.Struct({
  id: Schema.String,
  userId: Schema.String,
  title: Schema.String,
});
