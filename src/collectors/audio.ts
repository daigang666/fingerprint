/**
 * Audio 指纹采集器
 * @description 通过 OfflineAudioContext 生成音频信号，不同设备的音频处理有细微差异
 * @note 使用 OfflineAudioContext 替代已废弃的 ScriptProcessorNode，更加现代化且性能更好
 */

import { CollectorResult, ICollector, CollectorConfig } from '../types';
import { CollectorName } from '../constants';

export class AudioCollector implements ICollector {
  readonly name = CollectorName.Audio;

  async collect(_config?: CollectorConfig): Promise<CollectorResult> {
    try {
      // 检查 OfflineAudioContext 支持
      const OfflineAudioContextClass =
        window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;

      if (!OfflineAudioContextClass) {
        return {
          name: this.name,
          value: '',
          success: false,
          error: 'OfflineAudioContext not available',
        };
      }

      // 创建离线音频上下文
      // 参数: 声道数, 采样帧数, 采样率
      const sampleRate = 44100;
      const duration = 0.5; // 500ms
      const length = sampleRate * duration;
      const context = new OfflineAudioContextClass(1, length, sampleRate);

      // 创建振荡器
      const oscillator = context.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, context.currentTime);

      // 创建压缩器（增加设备差异性）
      const compressor = context.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, context.currentTime);
      compressor.knee.setValueAtTime(40, context.currentTime);
      compressor.ratio.setValueAtTime(12, context.currentTime);
      compressor.attack.setValueAtTime(0, context.currentTime);
      compressor.release.setValueAtTime(0.25, context.currentTime);

      // 连接节点: 振荡器 -> 压缩器 -> 目标
      oscillator.connect(compressor);
      compressor.connect(context.destination);

      // 启动振荡器
      oscillator.start(0);

      // 渲染音频并获取结果
      const renderedBuffer = await context.startRendering();
      const channelData = renderedBuffer.getChannelData(0);

      // 从音频数据中提取指纹特征
      // 采样策略：从多个位置采样以增加稳定性
      const fingerprints: number[] = [];
      const samplePoints = [
        4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000,
        9500, 10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500, 14000,
      ];

      for (const point of samplePoints) {
        if (point < channelData.length) {
          fingerprints.push(channelData[point]);
        }
      }

      // 计算音频特征的统计值（增加稳定性）
      const sum = fingerprints.reduce((a, b) => a + b, 0);
      const avg = sum / fingerprints.length;
      const variance = fingerprints.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / fingerprints.length;

      // 组合指纹值：采样点 + 统计特征
      const value = [
        ...fingerprints.map((v) => v.toFixed(8)),
        `avg:${avg.toFixed(8)}`,
        `var:${variance.toFixed(8)}`,
      ].join(',');

      return {
        name: this.name,
        value,
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
