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
const configPrefix = document.getElementById('config-prefix');

function getConfig() {
  return {
    enableIndexedDB: configIndexedDB.checked,
    strictBrowserMode: configStrict.checked,
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
[configIndexedDB, configStrict, configPrefix].forEach((el) => {
  el.addEventListener('change', () => {
    showMessage('配置已更改，点击"生成指纹"应用新配置');
  });
});
