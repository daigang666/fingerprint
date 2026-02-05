/**
 * 系统信息采集器
 * @description 采集时区、语言、硬件并发数、内存等系统级信息
 */

import { CollectorResult, ICollector, CollectorConfig } from '../types';
import { CollectorName } from '../constants';

export class SystemCollector implements ICollector {
  readonly name = CollectorName.System;

  async collect(config?: CollectorConfig): Promise<CollectorResult> {
    try {
      const components: string[] = [];

      // 严格浏览器模式：加入 User-Agent 以区分不同浏览器
      if (config?.strictBrowserMode) {
        components.push(`userAgent:${navigator.userAgent}`);
      }

      // 时区
      components.push(`timezone:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
      components.push(`timezoneOffset:${new Date().getTimezoneOffset()}`);

      // 语言设置（只使用主语言，navigator.languages 在无痕模式下会被截断）
      components.push(`language:${navigator.language}`);

      // 硬件并发数（CPU核心数）
      components.push(`hardwareConcurrency:${navigator.hardwareConcurrency || 'unknown'}`);

      // 设备内存（仅Chrome支持）
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory) {
        components.push(`deviceMemory:${deviceMemory}`);
      }

      // 平台信息
      components.push(`platform:${navigator.platform}`);

      // 是否启用Cookie
      components.push(`cookieEnabled:${navigator.cookieEnabled}`);

      // 是否启用Java
      components.push(`javaEnabled:${typeof navigator.javaEnabled === 'function' ? navigator.javaEnabled() : false}`);

      // Do Not Track 设置
      const doNotTrack = navigator.doNotTrack || (window as any).doNotTrack;
      components.push(`doNotTrack:${doNotTrack || 'unknown'}`);

      // PDF查看器支持
      components.push(`pdfViewerEnabled:${(navigator as any).pdfViewerEnabled ?? 'unknown'}`);

      // WebDriver检测（防止自动化工具）
      components.push(`webdriver:${navigator.webdriver || false}`);

      return {
        name: this.name,
        value: components.join('|'),
        success: true,
      };
    } catch (error) {
      return {
        name: this.name,
        value: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
