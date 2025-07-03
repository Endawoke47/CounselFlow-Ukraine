import { ServerResponse } from '../types/error';

export function handleQuery<
  DataT,
  FnT extends (...args: Parameters<FnT>) => Promise<ServerResponse<DataT>>,
>(fn: FnT) {
  return async (...args: Parameters<FnT>): Promise<DataT> => {
    const result: ServerResponse<DataT> = await fn(...args);

    if (
      !(typeof result === 'object') ||
      result == null ||
      !('message' in result) ||
      !('statusCode' in result)
    ) {
      return result as DataT;
    }

    if (typeof result.message === 'string') {
      throw result.message;
    }

    if (
      Array.isArray(result.message) &&
      typeof result.message[0] === 'string'
    ) {
      throw result.message[0];
    }

    throw new Error('Unknown error occurred');
  };
}
