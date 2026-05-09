import { Layer } from "effect";

import { v0Layer } from "@/http/versions/v0/http";
import { v1Layer } from "@/http/versions/v1/http";
import { v2Layer } from "@/http/versions/v2/http";

export const makeHttpApi = () => Layer.mergeAll(v0Layer, v1Layer, v2Layer);
