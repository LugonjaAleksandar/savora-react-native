import { CancelledError, failure, Result, success } from './result';

export type Fetch = typeof fetch;

export type RequestOptions = {
  query?: Record<string, string>;
  /** Aborting it means the caller no longer wants the response; the request rejects with `CancelledError`. */
  signal?: AbortSignal;
};

/**
 * Thin JSON-over-HTTP client: builds URLs, decodes bodies and maps every
 * failure mode to an `AppFailure`. `fetch` is injected so tests can replay
 * canned responses.
 */
export class ApiClient {
  static readonly defaultTimeoutMs = 15_000;

  constructor(
    private readonly fetchFn: Fetch,
    private readonly baseUrl: string,
    private readonly timeoutMs = ApiClient.defaultTimeoutMs,
  ) {}

  async get(path: string, { query, signal }: RequestOptions = {}): Promise<Result<unknown>> {
    const url = this.makeUrl(path, query);
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), this.timeoutMs);
    const abortOnCancel = () => timeout.abort();
    signal?.addEventListener('abort', abortOnCancel);

    try {
      const response = await this.fetchFn(url, { signal: timeout.signal, headers: { Accept: 'application/json' } });
      if (response.status === 404) {
        return failure({ kind: 'notFound' });
      }
      if (!response.ok) {
        return failure({ kind: 'server', status: response.status });
      }
      try {
        return success(await response.json());
      } catch {
        return failure({ kind: 'parsing' });
      }
    } catch (error) {
      if (signal?.aborted) {
        throw new CancelledError();
      }
      // fetch rejects with TypeError when offline, and with AbortError on our timeout.
      if (error instanceof TypeError || (error instanceof Error && error.name === 'AbortError')) {
        return failure({ kind: 'network' });
      }
      return failure({ kind: 'unknown' });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abortOnCancel);
    }
  }

  private makeUrl(path: string, query?: Record<string, string>): string {
    const search = query
      ? '?' +
        Object.entries(query)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&')
      : '';
    return `${this.baseUrl}${path}${search}`;
  }
}
