/**
 * Every way a request can fail, as a closed union. The UI maps each kind to
 * localized copy, never to a raw error message.
 */
export type AppFailure =
  | { kind: 'network' }
  | { kind: 'server'; status: number }
  | { kind: 'notFound' }
  | { kind: 'parsing' }
  | { kind: 'unknown' };

/** Result of a data operation. A `switch` over it is exhaustive, unlike try/catch. */
export type Result<T> = { ok: true; data: T } | { ok: false; failure: AppFailure };

export const success = <T>(data: T): Result<T> => ({ ok: true, data });

export const failure = <T = never>(value: AppFailure): Result<T> => ({ ok: false, failure: value });

export const mapResult = <T, R>(result: Result<T>, transform: (data: T) => R): Result<R> =>
  result.ok ? success(transform(result.data)) : result;

/** Thrown (and caught) only to abandon work that a newer request has replaced. */
export class CancelledError extends Error {
  constructor() {
    super('Cancelled');
    this.name = 'CancelledError';
  }
}
