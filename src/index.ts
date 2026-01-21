/**
 * 设备指纹模块 - 主入口
 *
 * @description
 * 独立、高内聚的设备指纹模块，便于复用到其他系统。
 *
 * @example
 * ```typescript
 * import { getDeviceFingerprint, initFingerprint } from 'src/utils/fingerprint';
 *
 * // 方式1: 使用默认配置
 * const fp = await getDeviceFingerprint();
 * console.log(fp.fingerprint); // 32位MD5哈希
 *
 * // 方式2: 自定义配置
 * initFingerprint({
 *   cacheExpiry: 7 * 24 * 60 * 60 * 1000, // 7天
 *   storageKeyPrefix: 'myapp',
 * });
 * const fp2 = await getDeviceFingerprint();
 * ```
 *
 * @author IDaaS Team
 * @version 1.0.0
 */

import { FingerprintManager } from './core/fingerprint-manager';
import { FingerprintResult, FingerprintConfig } from './types';
import { HTTP_HEADER_NAME } from './constants';

// 单例实例
let manager: FingerprintManager | null = null;

/**
 * 初始化指纹模块（可选）
 * @param config 配置选项
 */
export function initFingerprint(config?: FingerprintConfig): void {
  manager = new FingerprintManager(config);
}

/**
 * 获取指纹管理器实例
 */
function getManager(): FingerprintManager {
  if (!manager) {
    manager = new FingerprintManager();
  }
  return manager;
}

/**
 * 获取设备指纹
 * @returns 指纹结果
 */
export async function getDeviceFingerprint(): Promise<FingerprintResult> {
  return getManager().getFingerprint();
}

/**
 * 获取指纹值（简化版，仅返回哈希字符串）
 * @returns 32位MD5哈希字符串
 */
export async function getFingerprint(): Promise<string> {
  const result = await getManager().getFingerprint();
  return result.fingerprint;
}

/**
 * 强制刷新指纹
 * @returns 新的指纹结果
 */
export async function refreshFingerprint(): Promise<FingerprintResult> {
  return getManager().refresh();
}

/**
 * 清除指纹缓存
 */
export async function clearFingerprint(): Promise<void> {
  return getManager().clear();
}

/**
 * 获取HTTP Header名称
 */
export function getHeaderName(): string {
  return HTTP_HEADER_NAME;
}

// 导出类型和常量（便于外部使用）
export type { FingerprintResult, FingerprintConfig } from './types';
export { HTTP_HEADER_NAME } from './constants';
