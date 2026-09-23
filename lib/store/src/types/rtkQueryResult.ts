import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

export type RtqMutationResult<T> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: FetchBaseQueryError | SerializedError };

export type RtqQueryResult<T> = RtqMutationResult<T>;

export const unwrapMutation = <T, Args extends unknown[]>(
  trigger: (...args: Args) => Promise<RtqMutationResult<T>>
): ((...args: Args) => Promise<T>) => {
  return async (...args: Args) => {
    const result = await trigger(...args);
    if (result.error) throw result.error;
    return result.data;
  };
};
