/**
 * Canvas 指纹采集器
 * @description 通过Canvas绘制特定图形，利用不同设备的渲染差异生成指纹
 * 参考 FingerprintJS 的噪声检测策略：双重编码检测浏览器是否添加随机噪声
 */

import { CollectorResult, ICollector, CollectorConfig } from '../types';
import { CollectorName } from '../constants';

export class CanvasCollector implements ICollector {
  readonly name = CollectorName.Canvas;

  /**
   * 检测是否为已知会添加 Canvas 噪声的浏览器
   * Safari 17+ 在隐私模式下会添加一致的会话噪声（每次调用相同，但与正常模式不同）
   */
  private isKnownNoisyBrowser(): boolean {
    const ua = navigator.userAgent;

    // 检测 Safari 17+
    const safariMatch = ua.match(/Version\/(\d+).*Safari/);
    if (safariMatch && parseInt(safariMatch[1], 10) >= 17) {
      return true;
    }

    return false;
  }

  async collect(_config?: CollectorConfig): Promise<CollectorResult> {
    try {
      // 检测已知会添加噪声的浏览器
      if (this.isKnownNoisyBrowser()) {
        return {
          name: this.name,
          value: '',
          success: false,
          error: 'Browser known for canvas anti-fingerprinting',
        };
      }

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
      // 使用内置字体避免字体偏好差异
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

      // 噪声检测：双重编码同一画布，比较结果
      // 如果浏览器添加了随机噪声（如无痕模式），两次编码结果会不同
      const dataUrl1 = canvas.toDataURL('image/png');
      const dataUrl2 = canvas.toDataURL('image/png');

      if (dataUrl1 !== dataUrl2) {
        // 检测到噪声，标记为不稳定，不参与指纹计算
        return {
          name: this.name,
          value: '',
          success: false,
          error: 'Canvas noise detected (unstable)',
        };
      }

      return {
        name: this.name,
        value: dataUrl1,
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
