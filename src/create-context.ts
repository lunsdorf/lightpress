import { IncomingMessage } from "http";
import { parse } from "url";
import { LightpressContext } from "./types/lightpress-context";

export function createContext(request: IncomingMessage): LightpressContext {
  return {
    url: parse(request.url || "/", true),
    request,
  };
}
