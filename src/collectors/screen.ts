/**
 * 屏幕信息采集器
 * @description 采集屏幕分辨率、色深、像素比等信息
 */

import { CollectorResult, ICollector, CollectorConfig } from '../types';
import { CollectorName } from '../constants';

export class ScreenCollector implements ICollector {
  readonly name = CollectorName.Screen;

  /**
   * 检测是否为 Safari 17+
   * Safari 17+ 在无痕模式下会返回窗口尺寸而非屏幕分辨率
   */
  private isSafari17Plus(): boolean {
    const ua = navigator.userAgent;
    const safariMatch = ua.match(/Version\/(\d+).*Safari/);
    return !!(safariMatch && parseInt(safariMatch[1], 10) >= 17);
  }

  async collect(_config?: CollectorConfig): Promise<CollectorResult> {
    try {
      const components: string[] = [];
      const isSafari17Plus = this.isSafari17Plus();

      // Safari 17+ 无痕模式会返回窗口尺寸，跳过这些不稳定的属性
      if (!isSafari17Plus) {
        // 屏幕分辨率
        components.push(`width:${screen.width}`);
        components.push(`height:${screen.height}`);

        // 可用区域
        components.push(`availWidth:${screen.availWidth}`);
        components.push(`availHeight:${screen.availHeight}`);
      }

      // 色深
      components.push(`colorDepth:${screen.colorDepth}`);
      components.push(`pixelDepth:${screen.pixelDepth}`);

      // 设备像素比
      components.push(`devicePixelRatio:${window.devicePixelRatio || 1}`);

      // 屏幕方向
      if (screen.orientation) {
        components.push(`orientation:${screen.orientation.type}`);
      }

      // 触摸支持
      const maxTouchPoints = navigator.maxTouchPoints || 0;
      components.push(`maxTouchPoints:${maxTouchPoints}`);
      components.push(`touchSupport:${maxTouchPoints > 0}`);

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
