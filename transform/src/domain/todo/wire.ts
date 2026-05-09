import { Schema, SchemaGetter } from "effect";
import { Todo } from "./model";

const CanonicalPayload = Schema.Struct({
  title: Schema.String,
  done: Schema.Boolean,
  priority: Schema.Int,
});

const WirePayloadV0 = Schema.Struct({ title: Schema.String });
const WirePayloadV1 = Schema.Struct({ title: Schema.String, done: Schema.Boolean });

const WireResponseV0 = Schema.Struct({ id: Schema.String, userId: Schema.String, title: Schema.String });
const WireResponseV1 = Schema.Struct({ id: Schema.String, userId: Schema.String, title: Schema.String, done: Schema.Boolean });

export const v0 = {
  createPayload: WirePayloadV0.pipe(
    Schema.decodeTo(CanonicalPayload, {
      decode: SchemaGetter.transform((wire) => ({
        title: wire.title,
        done: false,
        priority: 0,
      })),
      encode: SchemaGetter.transform((canonical) => ({
        title: canonical.title,
      })),
    }),
  ),
  createResponse: WireResponseV0.pipe(
    Schema.decodeTo(Todo, {
      decode: SchemaGetter.transform((wire) => ({
        id: wire.id,
        userId: wire.userId,
        title: wire.title,
        done: false,
        priority: 0,
      })),
      encode: SchemaGetter.transform((todo) => ({
        id: todo.id,
        userId: todo.userId,
        title: todo.title,
      })),
    }),
  ),
} as const;

export const v1 = {
  createPayload: WirePayloadV1.pipe(
    Schema.decodeTo(CanonicalPayload, {
      decode: SchemaGetter.transform((wire) => ({
        title: wire.title,
        done: wire.done,
        priority: 0,
      })),
      encode: SchemaGetter.transform((canonical) => ({
        title: canonical.title,
        done: canonical.done,
      })),
    }),
  ),
  createResponse: WireResponseV1.pipe(
    Schema.decodeTo(Todo, {
      decode: SchemaGetter.transform((wire) => ({
        id: wire.id,
        userId: wire.userId,
        title: wire.title,
        done: wire.done,
        priority: 0,
      })),
      encode: SchemaGetter.transform((todo) => ({
        id: todo.id,
        userId: todo.userId,
        title: todo.title,
        done: todo.done,
      })),
    }),
  ),
} as const;

export const v2 = {
  createPayload: CanonicalPayload,
  createResponse: Todo,
} as const;
