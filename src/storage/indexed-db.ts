/**
 * IndexedDB 存储实现
 * @description 相比localStorage更难被用户清除，提供更好的持久性
 */

import { CachedFingerprint, IStorage } from '../types';
import { IDB_DATABASE_NAME, IDB_STORE_NAME, STORAGE_KEY } from '../constants';

export class IndexedDBAdapter implements IStorage {
  private readonly dbName: string;
  private readonly storeName: string;
  private readonly key: string;
  private db: IDBDatabase | null = null;

  constructor(prefix?: string) {
    this.dbName = prefix ? `${prefix}_${IDB_DATABASE_NAME}` : IDB_DATABASE_NAME;
    this.storeName = IDB_STORE_NAME;
    this.key = STORAGE_KEY;
  }

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async get(): Promise<CachedFingerprint | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(this.key);

        request.onerror = () => {
          resolve(null);
        };

        request.onsuccess = () => {
          const result = request.result;
          if (result && result.data) {
            resolve(result.data as CachedFingerprint);
          } else {
            resolve(null);
          }
        };
      });
    } catch {
      return null;
    }
  }

  async set(data: CachedFingerprint): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put({ id: this.key, data });

        request.onerror = () => {
          reject(new Error('Failed to save to IndexedDB'));
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.warn('[Fingerprint] Failed to save to IndexedDB:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.delete(this.key);
        resolve();
      });
    } catch {
      // 忽略清除错误
    }
  }
}
