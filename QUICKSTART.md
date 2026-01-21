# @gangdai/fingerprint 快速开始

## 项目结构

```
gangdai-fingerprint/
├── src/                    # 源代码
│   ├── collectors/         # 特征采集器
│   ├── core/              # 核心逻辑
│   ├── storage/           # 存储层
│   ├── constants.ts       # 常量定义
│   ├── types.ts           # 类型定义
│   └── index.ts           # 主入口
├── dist/                  # 构建产物（构建后生成）
├── package.json           # 包配置
├── tsconfig.json          # TypeScript 配置
├── tsup.config.ts         # 构建配置
├── .eslintrc.js          # ESLint 配置
├── README.md             # 使用文档
├── PUBLISH.md            # 发布指南
├── MIGRATION.md          # 迁移指南
├── EXAMPLES.md           # 使用示例
├── CHANGELOG.md          # 变更日志
└── LICENSE               # 开源协议
```

## 开发流程

### 1. 安装依赖

```bash
cd gangdai-fingerprint
pnpm install
```

### 2. 开发模式

```bash
# 监听文件变化，自动构建
pnpm dev
```

### 3. 构建

```bash
# 构建生产版本
pnpm run build
```

构建产物：
- `dist/index.js` - CommonJS 格式
- `dist/index.mjs` - ES Module 格式
- `dist/index.d.ts` - TypeScript 类型声明

### 4. 类型检查

```bash
pnpm run type-check
```

### 5. 代码检查

```bash
pnpm run lint
```

## 发布流程

详见 [PUBLISH.md](./PUBLISH.md)

### 快速发布

```bash
# 1. 构建
pnpm run build

# 2. 更新版本
npm version patch  # 或 minor / major

# 3. 发布
npm publish --access public
```

## 在其他项目中使用

### 安装

```bash
pnpm add @gangdai/fingerprint
```

### 使用

```typescript
import { getFingerprint, HTTP_HEADER_NAME } from '@gangdai/fingerprint';

// 获取指纹
const fingerprint = await getFingerprint();

// 在请求中使用
axios.post('/api/login', data, {
  headers: {
    [HTTP_HEADER_NAME]: fingerprint,
  },
});
```

更多示例见 [EXAMPLES.md](./EXAMPLES.md)

## 迁移 IAM-Login

详见 [MIGRATION.md](./MIGRATION.md)

### 简要步骤

1. 安装包：`pnpm add @gangdai/fingerprint`
2. 更新导入：`'src/utils/fingerprint'` → `'@gangdai/fingerprint'`
3. 删除旧代码：`rm -rf src/utils/fingerprint`

## 常见问题

### Q: 如何修改包名？

修改 `package.json` 中的 `name` 字段。

### Q: 如何发布到私有仓库？

参考 [PUBLISH.md](./PUBLISH.md) 中的"发布到私有 npm 仓库"章节。

### Q: 如何添加新的采集器？

1. 在 `src/collectors/` 创建新的采集器文件
2. 实现 `ICollector` 接口
3. 在 `FingerprintManager` 中注册

## 维护

- **更新依赖**：`pnpm update`
- **查看过期依赖**：`pnpm outdated`
- **版本管理**：遵循语义化版本规范

## 相关文档

- [README.md](./README.md) - 完整使用文档
- [PUBLISH.md](./PUBLISH.md) - 发布指南
- [MIGRATION.md](./MIGRATION.md) - 迁移指南
- [EXAMPLES.md](./EXAMPLES.md) - 使用示例
- [CHANGELOG.md](./CHANGELOG.md) - 变更日志
