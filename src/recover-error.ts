import { LightpressRecoveryHandler } from "./types/lightpress-recovery-handler";
import { isLightpressError } from "./is-lightpress-error";

/**
 * Wraps a recover function to automatically recover from `LightpressError`s by
 * calling `toResult()` on it.
 * **WARNING:** does not catch errors from the recover function itself!
 */
export function recoverError(
  recover: LightpressRecoveryHandler
): LightpressRecoveryHandler {
  return (error) => {
    if (isLightpressError(error)) {
      try {
        return error.toResult();
      } catch (exception) {
        return recover(exception);
      }
    } else {
      return recover(error);
    }
  };
}
