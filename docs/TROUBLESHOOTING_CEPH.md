# Ceph 对象存储故障排除指南

本文档提供了 Ceph 对象存储集成过程中可能遇到的问题及解决方案。

## 常见错误及解决方案

### 1. "ceph storageType does not support" 错误

**错误信息:**
```
AppError: ceph storageType does not support.
    at new AppError (/app/server/utils/app-error.js:7:9)
    at Function.uploadFileToStorage (/app/server/utils/common.js:401:15)
```

**可能原因及解决方案:**

#### 原因 1: 环境变量未正确设置
**检查方法:**
```bash
# 检查环境变量
echo $STORAGE_TYPE
echo $CEPH_ACCESS_KEY_ID
echo $CEPH_SECRET_ACCESS_KEY
echo $CEPH_ENDPOINT
echo $CEPH_BUCKET_NAME
```

**解决方案:**
```bash
# 设置必要的环境变量
export STORAGE_TYPE=ceph
export CEPH_ACCESS_KEY_ID=your_access_key_id
export CEPH_SECRET_ACCESS_KEY=your_secret_access_key
export CEPH_BUCKET_NAME=your_bucket_name
export CEPH_ENDPOINT=http://your-ceph-rgw-endpoint:7480
export CEPH_DOWNLOAD_URL=http://your-ceph-rgw-endpoint:7480/your_bucket_name
```

#### 原因 2: 服务器未重启，仍在运行旧代码
**解决方案:**
```bash
# 重启应用服务器
docker-compose restart app-space-server
# 或者
pm2 restart app-space-server
# 或者
systemctl restart app-space-server
```

#### 原因 3: 代码部署问题
**检查方法:**
```bash
# 检查代码是否包含 Ceph 支持
grep -n "storageType === 'ceph'" server/utils/common.js
grep -n "uploadFileToCeph" server/utils/common.js
```

**解决方案:**
确保代码已正确部署，包含最新的 Ceph 支持代码。

#### 原因 4: Docker 容器使用旧镜像
**解决方案:**
```bash
# 重新构建 Docker 镜像
docker-compose build --no-cache app-space-server
docker-compose up -d app-space-server
```

### 2. 模块导入错误

**错误信息:**
```
require is not defined in ES module scope
```

**解决方案:**
确保所有模块导入使用一致的语法（ES6 import 或 CommonJS require）。

### 3. Ceph 连接错误

**错误信息:**
```
NetworkingError: connect ECONNREFUSED
```

**检查方法:**
```bash
# 测试网络连通性
curl -I http://your-ceph-rgw-endpoint:7480
telnet your-ceph-rgw-endpoint 7480
```

**解决方案:**
1. 检查 Ceph RGW 服务是否运行
2. 检查网络防火墙设置
3. 验证 endpoint 地址是否正确

### 4. 认证错误

**错误信息:**
```
SignatureDoesNotMatch: The request signature we calculated does not match
```

**解决方案:**
1. 验证 Access Key ID 和 Secret Access Key 是否正确
2. 检查系统时间是否同步
3. 确认 Ceph RGW 用户权限设置

## 调试步骤

### 1. 验证配置
```bash
# 运行配置验证脚本
node scripts/test-ceph-connection.js
```

### 2. 检查日志
```bash
# 查看应用日志
docker-compose logs -f app-space-server
# 或者
tail -f /var/log/app-space/server.log
```

### 3. 手动测试上传
```bash
# 使用 AWS CLI 测试 Ceph 连接
aws configure set aws_access_key_id $CEPH_ACCESS_KEY_ID
aws configure set aws_secret_access_key $CEPH_SECRET_ACCESS_KEY
aws configure set default.region us-east-1
aws --endpoint-url=$CEPH_ENDPOINT s3 ls s3://$CEPH_BUCKET_NAME
```

### 4. 验证代码加载
创建测试脚本验证代码是否正确加载：

```javascript
// test-ceph-support.js
import config from './server/config.js';
import common from './server/utils/common.js';

console.log('Storage Type:', config.storageType);
console.log('Ceph Config:', config.ceph);
console.log('uploadFileToCeph exists:', typeof common.uploadFileToCeph === 'function');
```

## 环境变量完整清单

### 必需变量
```bash
STORAGE_TYPE=ceph
CEPH_ACCESS_KEY_ID=your_access_key_id
CEPH_SECRET_ACCESS_KEY=your_secret_access_key
CEPH_BUCKET_NAME=your_bucket_name
CEPH_ENDPOINT=http://your-ceph-rgw-endpoint:7480
CEPH_DOWNLOAD_URL=http://your-ceph-rgw-endpoint:7480/your_bucket_name
```

### 可选变量
```bash
CEPH_REGION=us-east-1  # 默认值
CEPH_PREFIX=app-space  # 对象键前缀
```

## 部署检查清单

- [ ] 环境变量已正确设置
- [ ] Ceph RGW 服务正常运行
- [ ] 网络连通性正常
- [ ] 存储桶已创建
- [ ] 用户权限配置正确
- [ ] 应用服务器已重启
- [ ] 代码已正确部署
- [ ] 日志中无错误信息

## 联系支持

如果问题仍然存在，请提供以下信息：

1. 完整的错误日志
2. 环境变量配置（隐藏敏感信息）
3. Ceph 集群版本和配置
4. 应用部署方式（Docker/直接部署）
5. 网络拓扑信息

## 相关链接

- [Ceph 配置指南](CEPH_OSS_SETUP.md)
- [Ceph 官方文档](https://docs.ceph.com/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
