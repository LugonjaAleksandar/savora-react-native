import { KeyValueStore } from '@/core/storage/keyValueStore';

type Entry<T> = { savedAt: number; data: T };

const KEY_PREFIX = 'meals_cache_';

/** JSON cache with a timestamp per entry, layered over `KeyValueStore`. */
export class MealsCache {
  constructor(
    private readonly store: KeyValueStore,
    private readonly now: () => number = Date.now,
  ) {}

  async write<T>(key: string, data: T): Promise<void> {
    const entry: Entry<T> = { savedAt: this.now(), data };
    await this.store.setItem(KEY_PREFIX + key, JSON.stringify(entry));
  }

  /**
   * Returns the cached value, or `null` when it is missing, corrupt or older
   * than `maxAgeMs`. Passing `maxAgeMs = null` accepts stale data (offline fallback).
   */
  async read<T>(key: string, maxAgeMs: number | null): Promise<T | null> {
    const raw = await this.store.getItem(KEY_PREFIX + key);
    if (raw === null) {
      return null;
    }
    try {
      const entry = JSON.parse(raw) as Entry<T>;
      if (typeof entry.savedAt !== 'number' || !('data' in entry)) {
        throw new TypeError('Malformed cache entry');
      }
      if (maxAgeMs !== null && this.now() - entry.savedAt > maxAgeMs) {
        return null;
      }
      return entry.data;
    } catch {
      await this.store.removeItem(KEY_PREFIX + key);
      return null;
    }
  }
}
