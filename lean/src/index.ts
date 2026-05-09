import { Layer } from "effect";
import { BunRuntime } from "@effect/platform-bun";

import { makeHttpApi } from "@/http";
import { makeHttpLayer } from "@/layers/http";
import { makeLogLayer } from "@/layers/log";

const ApiLive = makeHttpApi();
const HttpLive = makeHttpLayer(ApiLive);
const LogLive = makeLogLayer();

HttpLive.pipe(Layer.provide(LogLive), Layer.launch, BunRuntime.runMain);
