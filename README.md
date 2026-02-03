# @gangdai/fingerprint

A lightweight, zero-dependency browser fingerprint collection library with full TypeScript support.

## Features

- 🔒 **High-precision fingerprinting**: Combines multiple dimensions to generate unique device identifiers
- 💾 **Smart caching**: Dual-layer caching with IndexedDB + LocalStorage, 30-day validity
- 🚀 **Lightweight & efficient**: Zero dependencies, small bundle size, excellent performance
- 📦 **Ready to use**: Simple API with full TypeScript support
- 🔄 **Fallback mechanism**: Automatically generates UUID when collection fails

## Installation

```bash
# Using pnpm (recommended)
pnpm add @gangdai/fingerprint

# Using npm
npm install @gangdai/fingerprint

# Using yarn
yarn add @gangdai/fingerprint
```

## Quick Start

### Basic Usage

```typescript
import { getDeviceFingerprint } from '@gangdai/fingerprint';

// Get device fingerprint
const result = await getDeviceFingerprint();
console.log(result.fingerprint); // "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
console.log(result.isFallback);  // false
console.log(result.timestamp);   // 1705824000000
```

### Get Fingerprint String Only

```typescript
import { getFingerprint } from '@gangdai/fingerprint';

const fingerprint = await getFingerprint();
console.log(fingerprint); // "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

### Custom Configuration

```typescript
import { initFingerprint, getDeviceFingerprint } from '@gangdai/fingerprint';

// Initialize with custom config
initFingerprint({
  cacheExpiry: 7 * 24 * 60 * 60 * 1000,  // Cache for 7 days
  enableIndexedDB: true,                  // Enable IndexedDB
  storageKeyPrefix: 'myapp',              // Custom storage key prefix
  version: 1,                             // Version number
});

// Use configured instance
const result = await getDeviceFingerprint();
```

### Use in HTTP Requests

```typescript
import { getFingerprint, HTTP_HEADER_NAME } from '@gangdai/fingerprint';
import axios from 'axios';

// Get fingerprint
const fingerprint = await getFingerprint();

// Include fingerprint in request headers
axios.post('/api/login', data, {
  headers: {
    [HTTP_HEADER_NAME]: fingerprint,  // 'X-Device-Fingerprint'
  },
});
```

### Refresh and Clear

```typescript
import { refreshFingerprint, clearFingerprint } from '@gangdai/fingerprint';

// Force refresh fingerprint (re-collect)
const newResult = await refreshFingerprint();

// Clear cached fingerprint
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
  cacheExpiry?: number;        // 缓存过期时间（毫秒），默认 20 年
  enableIndexedDB?: boolean;   // 是否启用 IndexedDB，默认 true
  storageKeyPrefix?: string;   // 存储键名前缀，默认 'df'
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
import { HTTP_HEADER_NAME } from '@gangdai/fingerprint';

console.log(HTTP_HEADER_NAME); // 'X-Device-Fingerprint'
```

## Collection Dimensions

The fingerprint collection includes the following dimensions:

- **Basic Information**: User Agent, language, timezone, screen resolution, color depth
- **Canvas Fingerprint**: Canvas rendering characteristics
- **WebGL Fingerprint**: WebGL renderer information
- **Audio Fingerprint**: Audio context characteristics
- **Font Detection**: System installed fonts list
- **Plugin Information**: Browser plugins list
- **Hardware Information**: CPU cores, memory size, touch support

## Caching Strategy

1. **Prioritize IndexedDB**: Persistent storage, unaffected by private mode
2. **Fallback to LocalStorage**: Alternative when IndexedDB is unavailable
3. **30-day validity**: Default cache for 30 days, customizable
4. **Version management**: Supports version numbers for future upgrades

## Fallback Mechanism

When fingerprint collection fails (e.g., private mode, permission restrictions), a UUID is automatically generated as a fallback identifier:

```typescript
const result = await getDeviceFingerprint();
if (result.isFallback) {
  console.log('Using fallback UUID:', result.fingerprint);
}
```

## TypeScript Support

Complete TypeScript type definitions:

```typescript
import type {
  FingerprintResult,
  FingerprintConfig,
  CollectorResult,
  CachedFingerprint
} from '@gangdai/fingerprint';
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Important Notes

1. **Privacy Compliance**: Ensure compliance with local privacy regulations (e.g., GDPR, CCPA) before use
2. **User Notification**: Recommend explaining the use of device fingerprinting in your privacy policy
3. **Not a Sole Identifier**: Recommend using in combination with other authentication methods
4. **Cache Clearing**: Users clearing browser data will cause fingerprint regeneration

## Use Cases

- 🔐 **Login Security**: Detect abnormal login behavior
- 🛡️ **Risk Control**: Identify malicious devices and fraudulent activities
- 📊 **User Analytics**: Count unique devices
- 🔄 **Session Management**: Cross-tab session correlation

## License

MIT License

## Support

For issues or suggestions, please visit [GitHub Issues](https://github.com/gangdai/fingerprint/issues).
