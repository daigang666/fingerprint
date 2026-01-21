/**
 * 指纹管理器 - 核心调度
 * @description 协调采集器、存储、缓存的核心类
 */

import {
  FingerprintResult,
  CachedFingerprint,
  FingerprintConfig,
  ICollector,
  IStorage
} from '../types';
import { DEFAULT_CACHE_EXPIRY, CURRENT_VERSION } from '../constants';
import { md5, generateUUID } from './hash';
import { createCollectors } from '../collectors';
import { LocalStorageAdapter } from '../storage/local-storage';
import { IndexedDBAdapter } from '../storage/indexed-db';

export class FingerprintManager {
  private config: Required<FingerprintConfig>;
  private collectors: ICollector[];
  private localStorage: IStorage;
  private indexedDB: IStorage | null;
  private cachedResult: FingerprintResult | null = null;

  constructor(config: FingerprintConfig = {}) {
    this.config = {
      cacheExpiry: config.cacheExpiry ?? DEFAULT_CACHE_EXPIRY,
      enableIndexedDB: config.enableIndexedDB ?? true,
      storageKeyPrefix: config.storageKeyPrefix ?? 'df',
      version: config.version ?? CURRENT_VERSION,
    };

    this.collectors = createCollectors();
    this.localStorage = new LocalStorageAdapter(this.config.storageKeyPrefix);
    this.indexedDB = this.config.enableIndexedDB
      ? new IndexedDBAdapter(this.config.storageKeyPrefix)
      : null;
  }

  /**
   * 获取设备指纹
   * @returns 指纹结果
   */
  async getFingerprint(): Promise<FingerprintResult> {
    // 1. 检查内存缓存
    if (this.cachedResult && !this.isExpired(this.cachedResult.expiresAt)) {
      return this.cachedResult;
    }

    // 2. 检查localStorage缓存
    const localCache = await this.localStorage.get();
    if (localCache && !this.isExpired(localCache.expiresAt)) {
      this.cachedResult = this.toResult(localCache);
      return this.cachedResult;
    }

    // 3. 检查IndexedDB缓存
    if (this.indexedDB) {
      const idbCache = await this.indexedDB.get();
      if (idbCache && !this.isExpired(idbCache.expiresAt)) {
        // 同步到localStorage
        await this.localStorage.set(idbCache);
        this.cachedResult = this.toResult(idbCache);
        return this.cachedResult;
      }
    }

    // 4. 重新采集指纹
    return this.collectAndCache();
  }

  /**
   * 强制重新采集指纹
   */
  async refresh(): Promise<FingerprintResult> {
    return this.collectAndCache();
  }

  /**
   * 清除缓存
   */
  async clear(): Promise<void> {
    this.cachedResult = null;
    await this.localStorage.clear();
    if (this.indexedDB) {
      await this.indexedDB.clear();
    }
  }

  /**
   * 采集并缓存指纹
   */
  private async collectAndCache(): Promise<FingerprintResult> {
    const { fingerprint, isFallback } = await this.collect();
    const now = Date.now();
    const cached: CachedFingerprint = {
      fingerprint,
      isFallback,
      createdAt: now,
      expiresAt: now + this.config.cacheExpiry,
      version: this.config.version,
    };

    // 双重存储
    await this.localStorage.set(cached);
    if (this.indexedDB) {
      await this.indexedDB.set(cached);
    }

    this.cachedResult = this.toResult(cached);
    return this.cachedResult;
  }

  /**
   * 执行采集
   */
  private async collect(): Promise<{ fingerprint: string; isFallback: boolean }> {
    try {
      // 并行执行所有采集器
      const results = await Promise.all(
        this.collectors.map((collector) => collector.collect())
      );

      // 过滤成功的结果
      const successResults = results.filter((r) => r.success && r.value);

      if (successResults.length === 0) {
        // 全部失败，使用兜底UUID
        return {
          fingerprint: generateUUID(),
          isFallback: true,
        };
      }

      // 拼接所有采集值并计算哈希
      const rawData = successResults
        .map((r) => `${r.name}:${r.value}`)
        .sort()
        .join('|');

      return {
        fingerprint: md5(rawData),
        isFallback: false,
      };
    } catch (error) {
      console.warn('[Fingerprint] Collection failed, using fallback UUID:', error);
      return {
        fingerprint: generateUUID(),
        isFallback: true,
      };
    }
  }

  /**
   * 检查是否过期
   */
  private isExpired(expiresAt: number): boolean {
    return Date.now() > expiresAt;
  }

  /**
   * 转换为结果对象
   */
  private toResult(cached: CachedFingerprint): FingerprintResult {
    return {
      fingerprint: cached.fingerprint,
      isFallback: cached.isFallback,
      timestamp: cached.createdAt,
      expiresAt: cached.expiresAt,
    };
  }
}
