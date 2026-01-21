# 使用示例

## 示例 1：在 HTTP 拦截器中使用

### Axios 拦截器

```typescript
// src/utils/http-client.ts
import axios from 'axios';
import { getFingerprint, HTTP_HEADER_NAME } from '@digitalsee/fingerprint';

const httpClient = axios.create({
  baseURL: '/api',
});

// 请求拦截器：自动添加设备指纹
httpClient.interceptors.request.use(
  async (config) => {
    try {
      const fingerprint = await getFingerprint();
      config.headers[HTTP_HEADER_NAME] = fingerprint;
    } catch (error) {
      console.error('Failed to get fingerprint:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default httpClient;
```

### UmiJS Request 配置

```typescript
// src/requestErrorConfig.ts
import { RequestConfig } from '@umijs/max';
import { getFingerprint, HTTP_HEADER_NAME } from '@digitalsee/fingerprint';

export const request: RequestConfig = {
  requestInterceptors: [
    async (url, options) => {
      try {
        const fingerprint = await getFingerprint();
        return {
          url,
          options: {
            ...options,
            headers: {
              ...options.headers,
              [HTTP_HEADER_NAME]: fingerprint,
            },
          },
        };
      } catch (error) {
        console.error('Failed to get fingerprint:', error);
        return { url, options };
      }
    },
  ],
};
```

## 示例 2：在登录页面使用

```typescript
// src/pages/Login/index.tsx
import { useState } from 'react';
import { getFingerprint, HTTP_HEADER_NAME } from '@digitalsee/fingerprint';
import { login } from '@/services/auth';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      // 获取设备指纹
      const fingerprint = await getFingerprint();

      // 登录请求
      const response = await login({
        ...values,
        headers: {
          [HTTP_HEADER_NAME]: fingerprint,
        },
      });

      console.log('Login success:', response);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 登录表单 */}
    </div>
  );
};
```

## 示例 3：初始化配置

```typescript
// src/app.tsx (UmiJS)
import { initFingerprint } from '@digitalsee/fingerprint';

// 应用初始化时配置指纹模块
export async function getInitialState() {
  // 初始化指纹配置
  initFingerprint({
    cacheExpiry: 7 * 24 * 60 * 60 * 1000,  // 7天缓存
    enableIndexedDB: true,
    storageKeyPrefix: 'iam-console',
    version: 1,
  });

  return {
    // 其他初始化状态
  };
}
```

## 示例 4：在 React 组件中使用

```typescript
// src/components/DeviceInfo.tsx
import { useEffect, useState } from 'react';
import { getDeviceFingerprint, FingerprintResult } from '@digitalsee/fingerprint';

export default function DeviceInfo() {
  const [fingerprint, setFingerprint] = useState<FingerprintResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFingerprint = async () => {
      try {
        const result = await getDeviceFingerprint();
        setFingerprint(result);
      } catch (error) {
        console.error('Failed to get fingerprint:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFingerprint();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3>设备信息</h3>
      <p>设备指纹: {fingerprint?.fingerprint}</p>
      <p>是否兜底: {fingerprint?.isFallback ? '是' : '否'}</p>
      <p>采集时间: {new Date(fingerprint?.timestamp || 0).toLocaleString()}</p>
    </div>
  );
}
```

## 示例 5：在 Vue 3 中使用

```typescript
// src/composables/useFingerprint.ts
import { ref, onMounted } from 'vue';
import { getDeviceFingerprint, type FingerprintResult } from '@digitalsee/fingerprint';

export function useFingerprint() {
  const fingerprint = ref<FingerprintResult | null>(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);

  const loadFingerprint = async () => {
    try {
      loading.value = true;
      fingerprint.value = await getDeviceFingerprint();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadFingerprint();
  });

  return {
    fingerprint,
    loading,
    error,
    refresh: loadFingerprint,
  };
}
```

```vue
<!-- src/components/DeviceInfo.vue -->
<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <h3>设备信息</h3>
    <p>设备指纹: {{ fingerprint?.fingerprint }}</p>
    <p>是否兜底: {{ fingerprint?.isFallback ? '是' : '否' }}</p>
    <button @click="refresh">刷新</button>
  </div>
</template>

<script setup lang="ts">
import { useFingerprint } from '@/composables/useFingerprint';

const { fingerprint, loading, error, refresh } = useFingerprint();
</script>
```

## 示例 6：全局单例模式

```typescript
// src/utils/fingerprint-singleton.ts
import { getFingerprint, initFingerprint } from '@digitalsee/fingerprint';

class FingerprintService {
  private static instance: FingerprintService;
  private fingerprintCache: string | null = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    // 私有构造函数
  }

  public static getInstance(): FingerprintService {
    if (!FingerprintService.instance) {
      FingerprintService.instance = new FingerprintService();
    }
    return FingerprintService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      initFingerprint({
        cacheExpiry: 30 * 24 * 60 * 60 * 1000,
        enableIndexedDB: true,
      });
      this.fingerprintCache = await getFingerprint();
    })();

    return this.initPromise;
  }

  public async getFingerprint(): Promise<string> {
    if (!this.fingerprintCache) {
      await this.initialize();
    }
    return this.fingerprintCache!;
  }

  public async refresh(): Promise<string> {
    this.fingerprintCache = await getFingerprint();
    return this.fingerprintCache;
  }
}

export const fingerprintService = FingerprintService.getInstance();
```

使用：

```typescript
import { fingerprintService } from '@/utils/fingerprint-singleton';

// 应用启动时初始化
await fingerprintService.initialize();

// 在任何地方使用
const fingerprint = await fingerprintService.getFingerprint();
```

## 示例 7：错误处理和降级

```typescript
// src/utils/fingerprint-with-fallback.ts
import { getFingerprint } from '@digitalsee/fingerprint';

/**
 * 获取指纹，失败时返回固定值
 */
export async function getFingerprintSafe(fallback = 'unknown'): Promise<string> {
  try {
    return await getFingerprint();
  } catch (error) {
    console.error('Failed to get fingerprint, using fallback:', error);
    return fallback;
  }
}

/**
 * 获取指纹，带重试机制
 */
export async function getFingerprintWithRetry(
  maxRetries = 3,
  delay = 1000
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await getFingerprint();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Failed to get fingerprint after retries');
}
```

## 示例 8：性能监控

```typescript
// src/utils/fingerprint-monitor.ts
import { getDeviceFingerprint } from '@digitalsee/fingerprint';

export async function getFingerprintWithMonitoring() {
  const startTime = performance.now();

  try {
    const result = await getDeviceFingerprint();
    const duration = performance.now() - startTime;

    // 上报性能数据
    console.log('Fingerprint collection time:', duration, 'ms');

    // 可以发送到监控系统
    // sendMetrics('fingerprint.collection.time', duration);

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error('Fingerprint collection failed:', duration, 'ms', error);
    throw error;
  }
}
```

## 示例 9：条件加载（按需加载）

```typescript
// src/utils/lazy-fingerprint.ts
let fingerprintModule: typeof import('@digitalsee/fingerprint') | null = null;

/**
 * 懒加载指纹模块
 */
export async function loadFingerprintModule() {
  if (!fingerprintModule) {
    fingerprintModule = await import('@digitalsee/fingerprint');
  }
  return fingerprintModule;
}

/**
 * 按需获取指纹
 */
export async function getFingerprintLazy(): Promise<string> {
  const module = await loadFingerprintModule();
  return module.getFingerprint();
}
```

## 示例 10：与状态管理集成（Redux）

```typescript
// src/store/fingerprintSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDeviceFingerprint, type FingerprintResult } from '@digitalsee/fingerprint';

interface FingerprintState {
  data: FingerprintResult | null;
  loading: boolean;
  error: string | null;
}

const initialState: FingerprintState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchFingerprint = createAsyncThunk(
  'fingerprint/fetch',
  async () => {
    return await getDeviceFingerprint();
  }
);

const fingerprintSlice = createSlice({
  name: 'fingerprint',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFingerprint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFingerprint.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchFingerprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch fingerprint';
      });
  },
});

export default fingerprintSlice.reducer;
```

使用：

```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFingerprint } from '@/store/fingerprintSlice';

function App() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.fingerprint);

  useEffect(() => {
    dispatch(fetchFingerprint());
  }, [dispatch]);

  return <div>{loading ? 'Loading...' : data?.fingerprint}</div>;
}
```
