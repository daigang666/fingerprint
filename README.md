# @digitalsee/fingerprint

浏览器设备指纹采集库，用于 DigitalSee IDSS 平台的设备识别和安全防护。

## 特性

- 🔒 **高精度指纹**：综合多维度特征生成唯一设备标识
- 💾 **智能缓存**：支持 IndexedDB + LocalStorage 双层缓存，30天有效期
- 🚀 **轻量高效**：零依赖，体积小，性能优异
- 📦 **开箱即用**：简洁的 API，支持 TypeScript
- 🔄 **兜底机制**：采集失败时自动生成 UUID 作为兜底方案

## 安装

```bash
# 使用 pnpm（推荐）
pnpm add @digitalsee/fingerprint

# 使用 npm
npm install @digitalsee/fingerprint

# 使用 yarn
yarn add @digitalsee/fingerprint
```

## 快速开始

### 基础使用

```typescript
import { getDeviceFingerprint } from '@digitalsee/fingerprint';

// 获取设备指纹
const result = await getDeviceFingerprint();
console.log(result.fingerprint); // "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
console.log(result.isFallback);  // false
console.log(result.timestamp);   // 1705824000000
```

### 仅获取指纹字符串

```typescript
import { getFingerprint } from '@digitalsee/fingerprint';

const fingerprint = await getFingerprint();
console.log(fingerprint); // "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

### 自定义配置

```typescript
import { initFingerprint, getDeviceFingerprint } from '@digitalsee/fingerprint';

// 初始化配置
initFingerprint({
  cacheExpiry: 7 * 24 * 60 * 60 * 1000,  // 缓存7天
  enableIndexedDB: true,                  // 启用 IndexedDB
  storageKeyPrefix: 'myapp',              // 自定义存储键前缀
  version: 1,                             // 版本号
});

// 使用配置后的实例
const result = await getDeviceFingerprint();
```

### 在 HTTP 请求中使用

```typescript
import { getFingerprint, HTTP_HEADER_NAME } from '@digitalsee/fingerprint';
import axios from 'axios';

// 获取指纹
const fingerprint = await getFingerprint();

// 在请求头中携带指纹
axios.post('/api/login', data, {
  headers: {
    [HTTP_HEADER_NAME]: fingerprint,  // 'X-Device-Fingerprint'
  },
});
```

### 刷新和清除

```typescript
import { refreshFingerprint, clearFingerprint } from '@digitalsee/fingerprint';

// 强制刷新指纹（重新采集）
const newResult = await refreshFingerprint();

// 清除缓存的指纹
await clearFingerprint();
```

## API 文档

### `getDeviceFingerprint(): Promise<FingerprintResult>`

获取完整的设备指纹信息。

**返回值：**
```typescript
interface FingerprintResult {
  fingerprint: string;  // 32位 MD5 哈希值
  isFallback: boolean;  // 是否为兜底 UUID
  timestamp: number;    // 采集时间戳
  expiresAt: number;    // 过期时间戳
}
```

### `getFingerprint(): Promise<string>`

获取设备指纹字符串（简化版）。

**返回值：** 32位 MD5 哈希字符串

### `initFingerprint(config?: FingerprintConfig): void`

初始化指纹模块配置（可选）。

**参数：**
```typescript
interface FingerprintConfig {
  cacheExpiry?: number;        // 缓存过期时间（毫秒），默认 30 天
  enableIndexedDB?: boolean;   // 是否启用 IndexedDB，默认 true
  storageKeyPrefix?: string;   // 存储键名前缀，默认 'digitalsee'
  version?: number;            // 版本号，默认 1
}
```

### `refreshFingerprint(): Promise<FingerprintResult>`

强制刷新指纹（重新采集，忽略缓存）。

### `clearFingerprint(): Promise<void>`

清除缓存的指纹数据。

### `getHeaderName(): string`

获取 HTTP Header 名称。

**返回值：** `'X-Device-Fingerprint'`

### 常量

```typescript
import { HTTP_HEADER_NAME } from '@digitalsee/fingerprint';

console.log(HTTP_HEADER_NAME); // 'X-Device-Fingerprint'
```

## 采集维度

指纹采集包含以下维度：

- **基础信息**：User Agent、语言、时区、屏幕分辨率、颜色深度
- **Canvas 指纹**：Canvas 渲染特征
- **WebGL 指纹**：WebGL 渲染器信息
- **Audio 指纹**：音频上下文特征
- **字体检测**：系统安装的字体列表
- **插件信息**：浏览器插件列表
- **硬件信息**：CPU 核心数、内存大小、触摸支持

## 缓存策略

1. **优先使用 IndexedDB**：持久化存储，不受隐私模式影响
2. **降级到 LocalStorage**：IndexedDB 不可用时的备选方案
3. **30天有效期**：默认缓存30天，可自定义
4. **版本管理**：支持版本号，便于后续升级

## 兜底机制

当指纹采集失败时（如隐私模式、权限限制等），会自动生成一个 UUID 作为兜底标识：

```typescript
const result = await getDeviceFingerprint();
if (result.isFallback) {
  console.log('使用兜底 UUID:', result.fingerprint);
}
```

## TypeScript 支持

完整的 TypeScript 类型定义：

```typescript
import type {
  FingerprintResult,
  FingerprintConfig,
  CollectorResult,
  CachedFingerprint
} from '@digitalsee/fingerprint';
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 注意事项

1. **隐私合规**：使用前请确保符合当地隐私法规（如 GDPR、CCPA）
2. **用户告知**：建议在隐私政策中说明设备指纹的使用目的
3. **不可作为唯一标识**：建议结合其他认证手段使用
4. **缓存清理**：用户清除浏览器数据会导致指纹重新生成

## 使用场景

- 🔐 **登录安全**：检测异常登录行为
- 🛡️ **风控防护**：识别恶意设备和刷单行为
- 📊 **用户分析**：统计独立设备数
- 🔄 **会话管理**：跨标签页的会话关联

## 许可证

MIT License

## 支持

如有问题或建议，请联系 DigitalSee 团队。
