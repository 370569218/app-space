# 更新日志

## [未发布] - 2025-07-01

### 新增功能
- ✨ 新增 Ceph 对象存储支持
  - 支持 Ceph RGW (RADOS Gateway) S3 兼容 API
  - 支持自定义 endpoint 和 region 配置
  - 支持对象键前缀配置
  - 支持强制路径样式访问（forcePathStyle）
  - 完整的错误处理和日志记录

### 配置更新
- 📝 新增 Ceph 存储相关环境变量配置
- 📝 更新 README.md 添加存储配置说明
- 📝 新增 Ceph 配置示例文件 `.env.ceph.example`
- 📝 新增 Ceph 配置详细文档 `docs/CEPH_OSS_SETUP.md`

### 开发工具
- 🔧 新增 Ceph 连接测试脚本 `scripts/test-ceph-connection.js`

### 技术细节
- 使用现有的 aws-sdk 实现 Ceph S3 兼容 API 支持
- 在 `server/utils/common.js` 中新增 `uploadFileToCeph` 方法
- 在 `server/config.js` 中新增 Ceph 配置项
- 支持的存储类型现在包括：local, s3, oss, qiniu, upyun, tencentcloud, ceph

---

## 历史版本

### 1.0.0 - Railway 部署支持
- 初始版本发布
- 支持 Railway 平台部署