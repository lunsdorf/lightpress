import { IncomingMessage } from "http";
import { LightpressContext } from "./types/lightpress-context";

export function createContext(request: IncomingMessage): LightpressContext {
  return { request };
}
