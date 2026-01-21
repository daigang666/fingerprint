# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-21

### Added
- 初始版本发布
- 浏览器设备指纹采集功能
- 多维度特征采集（Canvas、WebGL、Audio、字体、插件等）
- IndexedDB + LocalStorage 双层缓存机制
- 30天缓存有效期（可配置）
- UUID 兜底机制
- 完整的 TypeScript 类型支持
- CommonJS 和 ES Module 双格式支持
- 零外部依赖

### API
- `getDeviceFingerprint()` - 获取完整指纹信息
- `getFingerprint()` - 获取指纹字符串
- `initFingerprint(config)` - 初始化配置
- `refreshFingerprint()` - 强制刷新指纹
- `clearFingerprint()` - 清除缓存
- `getHeaderName()` - 获取 HTTP Header 名称
- `HTTP_HEADER_NAME` - HTTP Header 常量

### Documentation
- README.md - 完整使用文档
- PUBLISH.md - 发布指南
- MIGRATION.md - 迁移指南
- EXAMPLES.md - 使用示例
- CHANGELOG.md - 变更日志
