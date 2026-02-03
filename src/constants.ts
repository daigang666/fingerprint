/**
 * 设备指纹模块 - 常量配置
 */

/** 默认缓存过期时间：20年（毫秒） */
export const DEFAULT_CACHE_EXPIRY = 20 * 365 * 24 * 60 * 60 * 1000;

/** 存储键名 */
export const STORAGE_KEY = 'DEVICE_FINGERPRINT';

/** IndexedDB 数据库名 */
export const IDB_DATABASE_NAME = 'DeviceFingerprintDB';

/** IndexedDB 存储表名 */
export const IDB_STORE_NAME = 'fingerprints';

/** 当前版本号 */
export const CURRENT_VERSION = 1;

/** HTTP Header 名称 */
export const HTTP_HEADER_NAME = 'X-Device-Fingerprint';

/** 采集器名称枚举 */
export enum CollectorName {
  Canvas = 'canvas',
  WebGL = 'webgl',
  Audio = 'audio',
  Screen = 'screen',
  System = 'system',
}
