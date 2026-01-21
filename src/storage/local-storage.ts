/**
 * localStorage 存储实现
 */

import { CachedFingerprint, IStorage } from '../types';
import { STORAGE_KEY } from '../constants';

export class LocalStorageAdapter implements IStorage {
  private readonly key: string;

  constructor(prefix?: string) {
    this.key = prefix ? `${prefix}_${STORAGE_KEY}` : STORAGE_KEY;
  }

  async get(): Promise<CachedFingerprint | null> {
    try {
      const data = localStorage.getItem(this.key);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as CachedFingerprint;
    } catch {
      return null;
    }
  }

  async set(data: CachedFingerprint): Promise<void> {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {
      console.warn('[Fingerprint] Failed to save to localStorage:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.key);
    } catch {
      // 忽略清除错误
    }
  }
}
