# IAM-Login 迁移到 @gangdai/fingerprint 指南

## 迁移步骤

### 1. 安装新包

```bash
cd IAM-Login
pnpm add @gangdai/fingerprint
```

### 2. 更新导入语句

**修改前：**
```typescript
import { getFingerprint, HTTP_HEADER_NAME } from 'src/utils/fingerprint';
```

**修改后：**
```typescript
import { getFingerprint, HTTP_HEADER_NAME } from '@gangdai/fingerprint';
```

### 3. 删除旧的 fingerprint 模块

```bash
# 备份（可选）
mv src/utils/fingerprint src/utils/fingerprint.backup

# 或直接删除
rm -rf src/utils/fingerprint
```

### 4. 需要修改的文件

#### 文件：`src/io/http/http-client.ts`

**修改前：**
```typescript
import { getFingerprint, HTTP_HEADER_NAME } from 'src/utils/fingerprint';
```

**修改后：**
```typescript
import { getFingerprint, HTTP_HEADER_NAME } from '@gangdai/fingerprint';
```

### 5. 验证修改

```bash
# 类型检查
pnpm run tsc

# 启动开发服务器
pnpm dev

# 测试构建
pnpm build
```

## 注意事项

1. **API 完全兼容**：新包的 API 与原模块完全一致，无需修改业务逻辑
2. **类型支持**：新包提供完整的 TypeScript 类型定义
3. **功能一致**：所有功能（缓存、采集、兜底等）保持不变

## 其他项目迁移

其他项目（IAM-Console、IAM-Portal、IAM-Tenant）可以直接安装使用：

```bash
# 在各项目目录
pnpm add @gangdai/fingerprint
```

然后在需要的地方导入：

```typescript
import { getFingerprint, HTTP_HEADER_NAME } from '@gangdai/fingerprint';

// 在 HTTP 拦截器中使用
axios.interceptors.request.use(async (config) => {
  const fingerprint = await getFingerprint();
  config.headers[HTTP_HEADER_NAME] = fingerprint;
  return config;
});
```

## 回滚方案

如果遇到问题需要回滚：

```bash
# 1. 卸载新包
pnpm remove @gangdai/fingerprint

# 2. 恢复旧代码
mv src/utils/fingerprint.backup src/utils/fingerprint

# 3. 恢复导入语句
# 将 '@gangdai/fingerprint' 改回 'src/utils/fingerprint'
```
