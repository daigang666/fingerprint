/**
 * 屏幕信息采集器
 * @description 采集屏幕分辨率、色深、像素比等信息
 */

import { CollectorResult, ICollector } from '../types';
import { CollectorName } from '../constants';

export class ScreenCollector implements ICollector {
  readonly name = CollectorName.Screen;

  async collect(): Promise<CollectorResult> {
    try {
      const components: string[] = [];

      // 屏幕分辨率
      components.push(`width:${screen.width}`);
      components.push(`height:${screen.height}`);

      // 可用区域
      components.push(`availWidth:${screen.availWidth}`);
      components.push(`availHeight:${screen.availHeight}`);

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
