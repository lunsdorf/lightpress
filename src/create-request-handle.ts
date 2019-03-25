import { IncomingMessage, ServerResponse } from "http";

export type LightpressRequestHandle = {
  request: IncomingMessage;
  response: ServerResponse;
  timestamp: number;
};

export function createRequestHandle(
  timestamp: number,
  request: IncomingMessage,
  response: ServerResponse
): LightpressRequestHandle {
  return {
    request,
    response,
    timestamp
  };
}
