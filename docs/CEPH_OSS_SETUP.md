# Ceph 对象存储支持配置指南

本文档介绍如何在 app-space 项目中配置和使用 Ceph 对象存储服务。

## 概述

Ceph 是一个开源的分布式存储系统，其 RADOS Gateway (RGW) 提供了与 Amazon S3 兼容的 API。本项目通过 AWS SDK 实现了对 Ceph 对象存储的支持。

## 配置步骤

### 1. 环境变量配置

在 `docker/.env` 文件中配置以下环境变量：

```bash
# Ceph 对象存储配置
STORAGE_TYPE=ceph
CEPH_ACCESS_KEY_ID=your_access_key_id
CEPH_SECRET_ACCESS_KEY=your_secret_access_key
CEPH_BUCKET_NAME=your_bucket_name
CEPH_ENDPOINT=http://your-ceph-rgw-endpoint:7480
CEPH_REGION=us-east-1
CEPH_PREFIX=app-space
CEPH_DOWNLOAD_URL=http://your-ceph-rgw-endpoint:7480/your_bucket_name
```

### 2. 配置参数说明

- `STORAGE_TYPE`: 设置为 `ceph` 启用 Ceph 存储
- `CEPH_ACCESS_KEY_ID`: Ceph RGW 访问密钥 ID
- `CEPH_SECRET_ACCESS_KEY`: Ceph RGW 访问密钥
- `CEPH_BUCKET_NAME`: 存储桶名称
- `CEPH_ENDPOINT`: Ceph RGW 服务端点地址
- `CEPH_REGION`: S3 兼容区域（默认：us-east-1）
- `CEPH_PREFIX`: 对象键前缀（可选）
- `CEPH_DOWNLOAD_URL`: 文件下载基础 URL

### 3. Ceph RGW 准备工作

在使用前，请确保：

1. **Ceph RGW 服务已启动**
   ```bash
   # 检查 RGW 服务状态
   systemctl status ceph-radosgw@rgw.$(hostname)
   ```

2. **创建 RGW 用户**
   ```bash
   # 创建用户
   radosgw-admin user create --uid=app-space --display-name="App Space User"
   
   # 获取访问密钥
   radosgw-admin user info --uid=app-space
   ```

3. **创建存储桶**
   ```bash
   # 使用 s3cmd 或其他 S3 兼容工具创建桶
   s3cmd mb s3://your-bucket-name --host=your-ceph-rgw-endpoint:7480
   ```

### 4. 验证配置

启动应用后，上传文件时会自动使用 Ceph 存储。可以通过日志查看上传状态：

```bash
# 查看应用日志
docker-compose logs -f app-space-server
```

## 特性支持

- ✅ 文件上传到 Ceph 对象存储
- ✅ 支持对象键前缀配置
- ✅ 兼容 S3 API
- ✅ 支持公共读取权限
- ✅ 错误处理和日志记录

## 故障排除

### 常见问题

1. **连接超时**
   - 检查 `CEPH_ENDPOINT` 配置是否正确
   - 确认网络连通性
   - 验证 RGW 服务是否正常运行

2. **认证失败**
   - 验证 `CEPH_ACCESS_KEY_ID` 和 `CEPH_SECRET_ACCESS_KEY`
   - 确认用户权限设置

3. **存储桶不存在**
   - 确认 `CEPH_BUCKET_NAME` 配置正确
   - 检查存储桶是否已创建

### 调试日志

启用调试日志查看详细信息：

```bash
# 设置日志级别
export LOG_LEVEL=debug
```

## 性能优化建议

1. **网络优化**
   - 确保应用服务器与 Ceph 集群之间的网络延迟较低
   - 考虑使用专用网络连接

2. **存储桶策略**
   - 合理设置存储桶的副本数和纠删码配置
   - 根据访问模式优化存储类别

3. **并发控制**
   - 根据 Ceph 集群性能调整上传并发数
   - 监控 RGW 服务的负载情况

## 安全建议

1. **访问控制**
   - 使用最小权限原则配置 RGW 用户
   - 定期轮换访问密钥

2. **网络安全**
   - 在生产环境中使用 HTTPS
   - 配置防火墙规则限制访问

3. **数据加密**
   - 启用传输加密（TLS）
   - 考虑启用服务端加密

## 相关链接

- [Ceph 官方文档](https://docs.ceph.com/)
- [Ceph RGW S3 API 兼容性](https://docs.ceph.com/en/latest/radosgw/s3/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
