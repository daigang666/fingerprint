/**
 * 文档站点交互脚本
 * 使用打包后的 Fingerprint 库（通过 IIFE 格式引入，全局变量为 Fingerprint）
 */

/* global Fingerprint, hljs */
/* eslint-env browser */

// 初始化代码高亮
document.addEventListener('DOMContentLoaded', () => {
  hljs.highlightAll();
});

// ============ UI 交互 ============

const resultContainer = document.getElementById('demo-result');
const btnGenerate = document.getElementById('btn-generate');
const btnRefresh = document.getElementById('btn-refresh');
const btnClear = document.getElementById('btn-clear');
const configIndexedDB = document.getElementById('config-indexeddb');
const configStrict = document.getElementById('config-strict');
const configDebug = document.getElementById('config-debug');
const configPrefix = document.getElementById('config-prefix');

function getConfig() {
  return {
    enableIndexedDB: configIndexedDB.checked,
    strictBrowserMode: configStrict.checked,
    debug: configDebug.checked,
    storageKeyPrefix: configPrefix.value || 'df',
  };
}

function createManager() {
  const config = getConfig();
  // 使用打包后的库初始化
  Fingerprint.initFingerprint(config);
  return true;
}

function formatTimestamp(ts) {
  return new Date(ts).toLocaleString('zh-CN');
}

function renderResult(result, fromCache = false) {
  let debugHtml = '';
  if (result.debug) {
    const debug = result.debug;
    debugHtml = `
    <div class="result-item" style="margin-top: 16px; border-top: 1px solid #374151; padding-top: 16px;">
      <span class="result-label" style="color: #fbbf24;">调试信息</span>
    </div>
    <div class="result-item">
      <span class="result-label">总耗时</span>
      <span class="result-value">${debug.duration} ms</span>
    </div>
    <div class="result-item">
      <span class="result-label">User-Agent</span>
      <span class="result-value" style="font-size: 11px; word-break: break-all;">${debug.userAgent}</span>
    </div>
    <div class="result-item" style="flex-direction: column; align-items: flex-start;">
      <span class="result-label" style="margin-bottom: 8px;">采集器详情</span>
      <div style="width: 100%; overflow-x: auto;">
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <thead>
            <tr style="background: #1f2937;">
              <th style="padding: 8px; text-align: left; border: 1px solid #374151;">采集器</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #374151;">状态</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #374151;">耗时</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #374151;">值长度</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #374151;">值哈希</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #374151;">值预览</th>
            </tr>
          </thead>
          <tbody>
            ${debug.collectors.map(c => `
              <tr>
                <td style="padding: 8px; border: 1px solid #374151;">${c.name}</td>
                <td style="padding: 8px; border: 1px solid #374151; color: ${c.success ? '#10b981' : '#ef4444'};">${c.success ? '成功' : '失败'}</td>
                <td style="padding: 8px; border: 1px solid #374151;">${c.duration} ms</td>
                <td style="padding: 8px; border: 1px solid #374151;">${c.valueLength}</td>
                <td style="padding: 8px; border: 1px solid #374151; font-family: monospace; font-size: 10px;">${c.valueHash.substring(0, 8)}...</td>
                <td style="padding: 8px; border: 1px solid #374151; font-size: 10px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.value.substring(0, 50)}${c.value.length > 50 ? '...' : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="result-item" style="flex-direction: column; align-items: flex-start;">
      <span class="result-label" style="margin-bottom: 8px;">原始数据（用于哈希）</span>
      <pre style="width: 100%; background: #1f2937; padding: 12px; border-radius: 4px; font-size: 10px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; max-height: 200px; overflow-y: auto;">${debug.rawData}</pre>
    </div>
    `;
  }

  resultContainer.innerHTML = `
    <div class="result-item">
      <span class="result-label">指纹</span>
      <span class="result-value fingerprint">${result.fingerprint}</span>
    </div>
    <div class="result-item">
      <span class="result-label">是否兜底</span>
      <span class="result-value ${result.isFallback ? 'fallback' : 'success'}">
        ${result.isFallback ? '是 (UUID)' : '否 (真实指纹)'}
      </span>
    </div>
    <div class="result-item">
      <span class="result-label">来源</span>
      <span class="result-value">${fromCache ? '缓存' : '实时采集'}</span>
    </div>
    <div class="result-item">
      <span class="result-label">采集时间</span>
      <span class="result-value">${formatTimestamp(result.timestamp)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">过期时间</span>
      <span class="result-value">${formatTimestamp(result.expiresAt)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">严格浏览器模式</span>
      <span class="result-value">${configStrict.checked ? '已启用' : '未启用'}</span>
    </div>
    <div class="result-item">
      <span class="result-label">HTTP Header</span>
      <span class="result-value">${Fingerprint.HTTP_HEADER_NAME}</span>
    </div>
    ${debugHtml}
  `;
}

function showLoading() {
  resultContainer.innerHTML = '<div class="result-placeholder">正在采集指纹...</div>';
}

function showMessage(msg) {
  resultContainer.innerHTML = `<div class="result-placeholder">${msg}</div>`;
}

function showError(error) {
  resultContainer.innerHTML = `<div class="result-placeholder" style="color: #ef4444;">错误: ${error.message || error}</div>`;
}

// 生成指纹
btnGenerate.addEventListener('click', async () => {
  showLoading();
  try {
    createManager();
    const result = await Fingerprint.getDeviceFingerprint();
    renderResult(result);
  } catch (error) {
    showError(error);
  }
});

// 强制刷新
btnRefresh.addEventListener('click', async () => {
  showLoading();
  try {
    createManager();
    const result = await Fingerprint.refreshFingerprint();
    renderResult(result, false);
  } catch (error) {
    showError(error);
  }
});

// 清除缓存
btnClear.addEventListener('click', async () => {
  try {
    createManager();
    await Fingerprint.clearFingerprint();
    showMessage('缓存已清除，点击"生成指纹"重新采集');
  } catch (error) {
    showError(error);
  }
});

// 配置变更时提示
[configIndexedDB, configStrict, configDebug, configPrefix].forEach((el) => {
  el.addEventListener('change', () => {
    showMessage('配置已更改，点击"生成指纹"应用新配置');
  });
});
