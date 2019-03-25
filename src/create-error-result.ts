import { HttpError } from "./http-error";
import { LightpressRequestHandle } from "./create-request-handle";
import { LightpressResult } from "./send-result";

export function createErrorResult(_handle: LightpressRequestHandle, error: Error): LightpressResult {
  const { code } = HttpError.fromError(error);

  return {
    code,
  };
}
