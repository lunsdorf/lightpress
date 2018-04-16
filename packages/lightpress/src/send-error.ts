import { ServerRequest, ServerResponse } from "http";
import HttpError from "./HttpError";
import StaticStream from "./StaticStream";
import sendResult from "./send-result";

export default function sendError(req: ServerRequest, res: ServerResponse, error: Error): void {
  const httpError: HttpError = HttpError.fromError(error);

  sendResult(req, res, {
    code: httpError.code,
    data: new StaticStream(JSON.stringify(httpError)),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

