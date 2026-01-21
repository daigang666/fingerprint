/**
 * 采集器统一导出
 */

export { CanvasCollector } from './canvas';
export { WebGLCollector } from './webgl';
export { AudioCollector } from './audio';
export { ScreenCollector } from './screen';
export { SystemCollector } from './system';

import { ICollector } from '../types';
import { CanvasCollector } from './canvas';
import { WebGLCollector } from './webgl';
import { AudioCollector } from './audio';
import { ScreenCollector } from './screen';
import { SystemCollector } from './system';

/**
 * 创建所有采集器实例
 */
export function createCollectors(): ICollector[] {
  return [
    new CanvasCollector(),
    new WebGLCollector(),
    new AudioCollector(),
    new ScreenCollector(),
    new SystemCollector(),
  ];
}
