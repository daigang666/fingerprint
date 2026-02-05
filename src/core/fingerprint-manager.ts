/**
 * 指纹管理器 - 核心调度
 * @description 协调采集器、存储、缓存的核心类
 */

import {
  FingerprintResult,
  CachedFingerprint,
  FingerprintConfig,
  ICollector,
  IStorage,
  CollectorConfig,
  DebugInfo,
  CollectorDebugInfo
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
      strictBrowserMode: config.strictBrowserMode ?? false,
      debug: config.debug ?? false,
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
    const { fingerprint, isFallback, debugInfo } = await this.collect();
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

    this.cachedResult = this.toResult(cached, debugInfo);
    return this.cachedResult;
  }

  /**
   * 执行采集
   */
  private async collect(): Promise<{ fingerprint: string; isFallback: boolean; debugInfo?: DebugInfo }> {
    const startTime = performance.now();
    const collectorDebugInfos: CollectorDebugInfo[] = [];

    // 调试模式：输出开始采集日志
    if (this.config.debug) {
      console.group('[Fingerprint] 开始采集指纹');
      console.log('配置:', this.config);
      console.log('User-Agent:', navigator.userAgent);
    }

    try {
      // 采集器配置
      const collectorConfig: CollectorConfig = {
        strictBrowserMode: this.config.strictBrowserMode,
      };

      // 并行执行所有采集器，同时记录每个采集器的耗时
      const results = await Promise.all(
        this.collectors.map(async (collector) => {
          const collectorStart = performance.now();
          const result = await collector.collect(collectorConfig);
          const collectorDuration = performance.now() - collectorStart;

          // 收集调试信息
          const debugItem: CollectorDebugInfo = {
            name: result.name,
            success: result.success,
            duration: Math.round(collectorDuration * 100) / 100,
            value: result.value ? result.value.substring(0, 200) : '',
            valueLength: result.value?.length || 0,
            valueHash: result.value ? md5(result.value) : '',
            error: result.error,
          };
          collectorDebugInfos.push(debugItem);

          // 调试模式：输出每个采集器的结果
          if (this.config.debug) {
            const status = result.success ? '✓' : '✗';
            const color = result.success ? 'color: #10b981' : 'color: #ef4444';
            console.log(
              `%c${status} ${result.name}`,
              color,
              `| 耗时: ${debugItem.duration}ms`,
              `| 长度: ${debugItem.valueLength}`,
              `| 哈希: ${debugItem.valueHash.substring(0, 8)}...`,
              result.error ? `| 错误: ${result.error}` : ''
            );
            // 输出完整原始值（用于对比分析）
            console.log(`  └─ 原始值:`, result.value || '(空)');
          }

          return result;
        })
      );

      // 过滤成功的结果
      const successResults = results.filter((r) => r.success && r.value);

      if (successResults.length === 0) {
        // 全部失败，使用兜底UUID
        const fallbackFingerprint = generateUUID();
        const totalDuration = Math.round((performance.now() - startTime) * 100) / 100;

        if (this.config.debug) {
          console.warn('[Fingerprint] 所有采集器失败，使用兜底 UUID:', fallbackFingerprint);
          console.log(`[Fingerprint] 总耗时: ${totalDuration}ms`);
          console.groupEnd();
        }

        return {
          fingerprint: fallbackFingerprint,
          isFallback: true,
          debugInfo: this.config.debug ? {
            duration: totalDuration,
            collectors: collectorDebugInfos,
            rawData: '',
            userAgent: navigator.userAgent,
          } : undefined,
        };
      }

      // 拼接所有采集值并计算哈希
      const rawData = successResults
        .map((r) => `${r.name}:${r.value}`)
        .sort()
        .join('|');

      const fingerprint = md5(rawData);
      const totalDuration = Math.round((performance.now() - startTime) * 100) / 100;

      // 调试模式：输出最终结果
      if (this.config.debug) {
        console.log('[Fingerprint] 成功采集器:', successResults.map(r => r.name).join(', '));
        console.log('[Fingerprint] 原始数据长度:', rawData.length);
        console.log('[Fingerprint] 最终指纹:', fingerprint);
        console.log(`[Fingerprint] 总耗时: ${totalDuration}ms`);
        console.groupEnd();
      }

      return {
        fingerprint,
        isFallback: false,
        debugInfo: this.config.debug ? {
          duration: totalDuration,
          collectors: collectorDebugInfos,
          rawData,
          userAgent: navigator.userAgent,
        } : undefined,
      };
    } catch (error) {
      const totalDuration = Math.round((performance.now() - startTime) * 100) / 100;
      const fallbackFingerprint = generateUUID();

      if (this.config.debug) {
        console.error('[Fingerprint] 采集异常:', error);
        console.warn('[Fingerprint] 使用兜底 UUID:', fallbackFingerprint);
        console.log(`[Fingerprint] 总耗时: ${totalDuration}ms`);
        console.groupEnd();
      } else {
        console.warn('[Fingerprint] Collection failed, using fallback UUID:', error);
      }

      return {
        fingerprint: fallbackFingerprint,
        isFallback: true,
        debugInfo: this.config.debug ? {
          duration: totalDuration,
          collectors: collectorDebugInfos,
          rawData: '',
          userAgent: navigator.userAgent,
        } : undefined,
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
  private toResult(cached: CachedFingerprint, debugInfo?: DebugInfo): FingerprintResult {
    const result: FingerprintResult = {
      fingerprint: cached.fingerprint,
      isFallback: cached.isFallback,
      timestamp: cached.createdAt,
      expiresAt: cached.expiresAt,
    };

    if (debugInfo) {
      result.debug = debugInfo;
    }

    return result;
  }
}
