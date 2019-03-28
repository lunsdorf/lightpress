import { LightpressInfo } from "./lightpress-info";
import { LightpressResult } from "./lightpress-result";

export type LightpressHandler<T extends LightpressInfo = LightpressInfo> = (info: T) => LightpressResult | Promise<LightpressResult>;
