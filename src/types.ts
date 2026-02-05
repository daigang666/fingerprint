/**
 * 设备指纹模块 - 类型定义
 * @description 独立模块，便于其他系统复用
 */

/** 指纹采集结果 */
export interface FingerprintResult {
  /** 指纹哈希值 (32位MD5) */
  fingerprint: string;
  /** 是否为兜底UUID */
  isFallback: boolean;
  /** 采集时间戳 */
  timestamp: number;
  /** 过期时间戳 */
  expiresAt: number;
}

/** 采集器结果 */
export interface CollectorResult {
  /** 采集器名称 */
  name: string;
  /** 采集的原始值 */
  value: string;
  /** 是否采集成功 */
  success: boolean;
  /** 错误信息（如果失败） */
  error?: string;
}

/** 缓存数据结构 */
export interface CachedFingerprint {
  /** 指纹值 */
  fingerprint: string;
  /** 是否为兜底值 */
  isFallback: boolean;
  /** 创建时间戳 */
  createdAt: number;
  /** 过期时间戳 */
  expiresAt: number;
  /** 版本号（用于后续升级） */
  version: number;
}

/** 采集器配置 */
export interface CollectorConfig {
  /** 严格浏览器模式 */
  strictBrowserMode?: boolean;
}

/** 采集器接口 */
export interface ICollector {
  /** 采集器名称 */
  readonly name: string;
  /** 执行采集 */
  collect(config?: CollectorConfig): Promise<CollectorResult>;
}

/** 存储接口 */
export interface IStorage {
  /** 获取指纹 */
  get(): Promise<CachedFingerprint | null>;
  /** 保存指纹 */
  set(data: CachedFingerprint): Promise<void>;
  /** 清除指纹 */
  clear(): Promise<void>;
}

/** 指纹管理器配置 */
export interface FingerprintConfig {
  /** 缓存过期时间（毫秒），默认30天 */
  cacheExpiry?: number;
  /** 是否启用IndexedDB，默认true */
  enableIndexedDB?: boolean;
  /** 存储键名前缀 */
  storageKeyPrefix?: string;
  /** 当前版本号 */
  version?: number;
  /**
   * 严格浏览器模式，默认false
   * 启用后会在指纹计算中加入浏览器特征（User-Agent），
   * 使得同一设备上不同浏览器产生不同指纹。
   * 注意：这不符合设备指纹的标准定义，仅用于特殊业务场景。
   */
  strictBrowserMode?: boolean;
}
