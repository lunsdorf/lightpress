import { IncomingMessage, ServerResponse } from "http";
import { LightpressContext } from "./types/lightpress-context";

export function createContext(
  request: IncomingMessage,
  _response: ServerResponse
): LightpressContext {
  return {
    request,
  };
}
