import { ServerRequest, ServerResponse } from "http";
import HttpError from "./HttpError";
import sendResult from "./send-result";

export default function sendError(req: ServerRequest, res: ServerResponse, error: Error): void {
  const httpError = HttpError.fromError(error);

  sendResult(req, res, {
    code: httpError.code,
    data: `${httpError.code} ${httpError.message}`,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

