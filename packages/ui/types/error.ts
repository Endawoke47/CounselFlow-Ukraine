export type CommonApiError = {
  error: string;
  message: string | string[];
  statusCode: number;
};

// Type guard to check if the response is a CommonApiError
export function isCommonApiError(
  response: unknown
): response is CommonApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    'message' in response &&
    'statusCode' in response
  );
}

export type ServerResponse<T = unknown> = CommonApiError | T;
