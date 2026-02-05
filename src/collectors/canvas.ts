/**
 * Canvas 指纹采集器
 * @description 通过Canvas绘制特定图形，利用不同设备的渲染差异生成指纹
 */

import { CollectorResult, ICollector, CollectorConfig } from '../types';
import { CollectorName } from '../constants';

export class CanvasCollector implements ICollector {
  readonly name = CollectorName.Canvas;

  async collect(_config?: CollectorConfig): Promise<CollectorResult> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return {
          name: this.name,
          value: '',
          success: false,
          error: 'Canvas context not available',
        };
      }

      canvas.width = 200;
      canvas.height = 50;

      // 绘制背景
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 200, 50);

      // 绘制文本（不同设备字体渲染有差异）
      ctx.fillStyle = '#069';
      ctx.font = '14px Arial';
      ctx.fillText('Device Fingerprint Canvas', 2, 15);

      // 绘制更多文本和特殊字符
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.font = '18px Times New Roman';
      ctx.fillText('!@#$%^&*()_+-=[]{}|;:', 4, 35);

      // 添加圆弧和渐变（增加差异化）
      ctx.beginPath();
      ctx.arc(150, 25, 20, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fillStyle = '#ff0';
      ctx.fill();

      // 添加阴影效果
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'blue';
      ctx.fillRect(160, 10, 30, 30);

      const dataUrl = canvas.toDataURL('image/png');

      return {
        name: this.name,
        value: dataUrl,
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
