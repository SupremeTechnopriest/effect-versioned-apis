import { Layer } from "effect";

import { layer as v0 } from "./v0";
import { layer as v1 } from "./v1";
import { layer as v2 } from "./v2";

export const makeHttpApi = () => Layer.mergeAll(v0, v1, v2);
