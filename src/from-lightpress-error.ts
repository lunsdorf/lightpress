import { LightpressRecoveryHandler } from "./types/lightpress-recovery-handler";
import { isLightpressError } from "./is-lightpress-error";

/**
 * Wraps a recover function to automatically recover from `LightpressError`s by
 * calling `toResult()` on it. All other errors are passed on to the given
 * recover function.
 * **WARNING:** does not catch errors from the recover function itself!
 */
export function fromLightpressError(
  recoverUnhandled: LightpressRecoveryHandler
): LightpressRecoveryHandler {
  return (request, error) => {
    if (isLightpressError(error)) {
      try {
        return error.toResult();
      } catch (exception) {
        return recoverUnhandled(request, exception);
      }
    } else {
      return recoverUnhandled(request, error);
    }
  };
}
