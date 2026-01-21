/**
 * WebGL 指纹采集器
 * @description 通过WebGL获取GPU渲染器信息，不同显卡有不同的标识
 */

import { CollectorResult, ICollector } from '../types';
import { CollectorName } from '../constants';

export class WebGLCollector implements ICollector {
  readonly name = CollectorName.WebGL;

  async collect(): Promise<CollectorResult> {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (!gl) {
        return {
          name: this.name,
          value: '',
          success: false,
          error: 'WebGL not available',
        };
      }

      const webglContext = gl as WebGLRenderingContext;
      const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info');

      const components: string[] = [];

      // 获取GPU渲染器信息
      if (debugInfo) {
        const vendor = webglContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        components.push(`vendor:${vendor}`);
        components.push(`renderer:${renderer}`);
      }

      // 获取WebGL基础参数
      components.push(`version:${webglContext.getParameter(webglContext.VERSION)}`);
      components.push(`shadingLanguageVersion:${webglContext.getParameter(webglContext.SHADING_LANGUAGE_VERSION)}`);

      // 获取最大纹理尺寸（不同GPU有差异）
      components.push(`maxTextureSize:${webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE)}`);
      components.push(`maxRenderbufferSize:${webglContext.getParameter(webglContext.MAX_RENDERBUFFER_SIZE)}`);
      components.push(`maxViewportDims:${webglContext.getParameter(webglContext.MAX_VIEWPORT_DIMS)}`);
      components.push(`maxVertexAttribs:${webglContext.getParameter(webglContext.MAX_VERTEX_ATTRIBS)}`);
      components.push(`maxVertexUniformVectors:${webglContext.getParameter(webglContext.MAX_VERTEX_UNIFORM_VECTORS)}`);
      components.push(`maxFragmentUniformVectors:${webglContext.getParameter(webglContext.MAX_FRAGMENT_UNIFORM_VECTORS)}`);

      // 获取支持的扩展列表
      const extensions = webglContext.getSupportedExtensions() || [];
      components.push(`extensions:${extensions.sort().join(',')}`);

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
