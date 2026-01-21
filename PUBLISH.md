# @digitalsee/fingerprint 发布指南

## 发布前准备

### 1. 安装依赖

```bash
cd digitalsee-fingerprint
pnpm install
```

### 2. 构建项目

```bash
pnpm run build
```

构建成功后，会在 `dist/` 目录生成以下文件：
- `index.js` - CommonJS 格式
- `index.mjs` - ES Module 格式
- `index.d.ts` - TypeScript 类型声明
- `*.map` - Source Map 文件

### 3. 验证构建产物

```bash
# 检查 dist 目录
ls -la dist/

# 验证类型声明
pnpm run type-check
```

### 4. 测试本地包（可选）

在发布前，可以在本地测试包是否正常工作：

```bash
# 在 digitalsee-fingerprint 目录
pnpm link --global

# 在 IAM-Login 目录
cd ../IAM-Login
pnpm link --global @digitalsee/fingerprint

# 测试完成后取消链接
pnpm unlink --global @digitalsee/fingerprint
```

## 发布到 npm

### 方式一：发布到公共 npm 仓库

#### 1. 登录 npm

```bash
npm login
# 输入用户名、密码、邮箱
```

#### 2. 发布包

```bash
# 首次发布
npm publish --access public

# 后续更新版本
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
npm publish
```

### 方式二：发布到私有 npm 仓库（推荐）

如果公司有私有 npm 仓库（如 Verdaccio、Nexus、Artifactory），推荐使用私有仓库。

#### 1. 配置私有仓库

创建或编辑 `.npmrc` 文件：

```bash
# 在 digitalsee-fingerprint 目录创建 .npmrc
registry=https://your-private-registry.com/
//your-private-registry.com/:_authToken=YOUR_AUTH_TOKEN
```

或者使用 npm 命令配置：

```bash
npm config set registry https://your-private-registry.com/
npm config set //your-private-registry.com/:_authToken YOUR_AUTH_TOKEN
```

#### 2. 登录私有仓库

```bash
npm login --registry=https://your-private-registry.com/
```

#### 3. 发布到私有仓库

```bash
npm publish --registry=https://your-private-registry.com/
```

### 方式三：使用 pnpm 发布

```bash
# 登录
pnpm login

# 发布
pnpm publish --access public

# 或发布到私有仓库
pnpm publish --registry=https://your-private-registry.com/
```

## 版本管理

### 语义化版本规范

遵循 [Semantic Versioning](https://semver.org/) 规范：

- **MAJOR（主版本）**：不兼容的 API 修改
- **MINOR（次版本）**：向下兼容的功能新增
- **PATCH（补丁版本）**：向下兼容的问题修正

### 更新版本号

```bash
# 补丁版本（bug 修复）
npm version patch
# 1.0.0 -> 1.0.1

# 次版本（新增功能）
npm version minor
# 1.0.0 -> 1.1.0

# 主版本（破坏性更新）
npm version major
# 1.0.0 -> 2.0.0

# 预发布版本
npm version prerelease --preid=beta
# 1.0.0 -> 1.0.1-beta.0
```

### 发布流程

```bash
# 1. 确保代码已提交
git status

# 2. 更新版本号（会自动创建 git tag）
npm version patch -m "chore: release v%s"

# 3. 构建
pnpm run build

# 4. 发布
npm publish

# 5. 推送到 git（包括 tag）
git push && git push --tags
```

## 在其他项目中使用

### 1. 安装包

```bash
# 在 IAM-Console、IAM-Portal、IAM-Tenant 等项目中
pnpm add @digitalsee/fingerprint

# 如果是私有仓库，需要先配置 registry
pnpm config set registry https://your-private-registry.com/
pnpm add @digitalsee/fingerprint
```

### 2. 使用示例

```typescript
// 在任何项目中导入
import { getFingerprint, HTTP_HEADER_NAME } from '@digitalsee/fingerprint';

// 在 HTTP 拦截器中使用
axios.interceptors.request.use(async (config) => {
  const fingerprint = await getFingerprint();
  config.headers[HTTP_HEADER_NAME] = fingerprint;
  return config;
});
```

## 常见问题

### Q1: 发布时提示权限错误

```bash
npm ERR! code E403
npm ERR! 403 Forbidden
```

**解决方案**：
1. 确认已登录：`npm whoami`
2. 检查包名是否已被占用
3. 如果是 scoped package（@digitalsee/xxx），确保使用 `--access public`

### Q2: 包名冲突

如果 `@digitalsee/fingerprint` 已被占用，可以修改为：
- `@digitalsee/device-fingerprint`
- `@digitalsee/browser-fingerprint`
- `@your-company/fingerprint`

修改 `package.json` 中的 `name` 字段即可。

### Q3: 如何撤销已发布的版本

```bash
# 撤销指定版本（24小时内）
npm unpublish @digitalsee/fingerprint@1.0.0

# 撤销整个包（慎用）
npm unpublish @digitalsee/fingerprint --force
```

**注意**：npm 不允许撤销发布超过 24 小时的版本。

### Q4: 如何发布 beta 版本

```bash
# 更新为 beta 版本
npm version prerelease --preid=beta
# 1.0.0 -> 1.0.1-beta.0

# 发布 beta 版本
npm publish --tag beta

# 用户安装 beta 版本
pnpm add @digitalsee/fingerprint@beta
```

## 持续集成（可选）

如果使用 CI/CD，可以配置自动发布：

### GitHub Actions 示例

创建 `.github/workflows/publish.yml`：

```yaml
name: Publish Package

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install
      - run: pnpm run build
      - run: pnpm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 维护建议

1. **定期更新依赖**：`pnpm update`
2. **保持文档同步**：更新功能时同步更新 README
3. **编写 CHANGELOG**：记录每个版本的变更
4. **添加测试**：确保代码质量
5. **版本规划**：提前规划主要版本的功能

## 联系方式

如有问题，请联系：
- 邮箱：your-email@digitalsee.com
- 内部文档：https://your-internal-docs.com
