type ApiErrorEnvelope = {
  error?: string;
  message?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryAfter?: number;

  constructor(args: {
    status: number;
    code: string;
    message: string;
    retryAfter?: number;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.code = args.code;
    this.retryAfter = args.retryAfter;
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let code = "internal_error";
  let message = response.statusText || "Request failed";

  try {
    const body = (await response.json()) as ApiErrorEnvelope;
    if (body.error) code = body.error;
    if (body.message) message = body.message;
  } catch {
    // The response had no JSON body; keep the defaults.
  }

  const retryAfterHeader = response.headers.get("retry-after");
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;

  return new ApiError({
    status: response.status,
    code,
    message,
    retryAfter: Number.isFinite(retryAfter) ? retryAfter : undefined,
  });
}
