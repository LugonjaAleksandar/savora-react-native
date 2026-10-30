import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

/**
 * Minimal persistence contract. Repositories and stores depend on this rather
 * than AsyncStorage, so tests run against `InMemoryKeyValueStore`. It matches
 * zustand's `StateStorage`, so persisted stores use the same seam.
 */
export interface KeyValueStore extends StateStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export class AsyncStorageKeyValueStore implements KeyValueStore {
  getItem(key: string) {
    return AsyncStorage.getItem(key);
  }

  setItem(key: string, value: string) {
    return AsyncStorage.setItem(key, value);
  }

  removeItem(key: string) {
    return AsyncStorage.removeItem(key);
  }
}

export class InMemoryKeyValueStore implements KeyValueStore {
  private readonly values = new Map<string, string>();

  async getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  async setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  async removeItem(key: string) {
    this.values.delete(key);
  }
}
