/**
 * Ceph 对象存储使用示例
 * 
 * 本示例展示如何在 app-space 项目中使用 Ceph 对象存储功能
 */

// 导入必要的模块
import common from '../server/utils/common.js';
import config from '../server/config.js';

/**
 * 示例 1: 基本文件上传
 */
async function basicUploadExample() {
  console.log('=== 基本文件上传示例 ===');
  
  try {
    // 假设我们有一个本地文件路径
    const localFilePath = '/tmp/example-app.apk';
    const storageKey = 'apps/android/example-app-v1.0.0.apk';
    
    // 使用 common.uploadFileToStorage 方法上传文件
    // 该方法会根据 config.storageType 自动选择存储方式
    const result = await common.uploadFileToStorage(storageKey, localFilePath);
    
    console.log('上传成功:', result);
    
    // 获取下载 URL
    const downloadUrl = common.getBlobDownloadUrl(storageKey);
    console.log('下载地址:', downloadUrl);
    
  } catch (error) {
    console.error('上传失败:', error.message);
  }
}

/**
 * 示例 2: 直接使用 Ceph 上传方法
 */
async function directCephUploadExample() {
  console.log('=== 直接 Ceph 上传示例 ===');
  
  try {
    const localFilePath = '/tmp/example-icon.png';
    const storageKey = 'icons/example-app-icon.png';
    
    // 直接调用 Ceph 上传方法
    const result = await common.uploadFileToCeph(storageKey, localFilePath);
    
    console.log('Ceph 上传成功:', result);
    
  } catch (error) {
    console.error('Ceph 上传失败:', error.message);
  }
}

/**
 * 示例 3: 配置验证
 */
function configValidationExample() {
  console.log('=== 配置验证示例 ===');
  
  // 检查 Ceph 配置是否完整
  const requiredConfigs = [
    'ceph.accessKeyId',
    'ceph.secretAccessKey',
    'ceph.endpoint',
    'ceph.bucketName'
  ];
  
  const missingConfigs = requiredConfigs.filter(configPath => {
    const value = configPath.split('.').reduce((obj, key) => obj?.[key], config);
    return !value;
  });
  
  if (missingConfigs.length > 0) {
    console.error('缺少以下 Ceph 配置:');
    missingConfigs.forEach(configPath => {
      console.error(`- ${configPath}`);
    });
    return false;
  }
  
  console.log('✅ Ceph 配置验证通过');
  console.log('当前配置:');
  console.log(`- Endpoint: ${config.ceph.endpoint}`);
  console.log(`- Bucket: ${config.ceph.bucketName}`);
  console.log(`- Region: ${config.ceph.region}`);
  console.log(`- Prefix: ${config.ceph.prefix || '(未设置)'}`);
  
  return true;
}

/**
 * 示例 4: 错误处理
 */
async function errorHandlingExample() {
  console.log('=== 错误处理示例 ===');
  
  try {
    // 尝试上传一个不存在的文件
    const result = await common.uploadFileToCeph('test-key', '/nonexistent/file.txt');
    console.log('不应该执行到这里');
    
  } catch (error) {
    console.log('捕获到预期的错误:');
    console.log(`- 错误类型: ${error.constructor.name}`);
    console.log(`- 错误消息: ${error.message}`);
    
    // 根据错误类型进行不同的处理
    if (error.message.includes('ENOENT')) {
      console.log('处理建议: 检查文件路径是否正确');
    } else if (error.message.includes('Access Denied')) {
      console.log('处理建议: 检查 Ceph 访问权限配置');
    } else if (error.message.includes('NoSuchBucket')) {
      console.log('处理建议: 检查存储桶是否存在');
    }
  }
}

/**
 * 示例 5: 批量上传
 */
async function batchUploadExample() {
  console.log('=== 批量上传示例 ===');
  
  const files = [
    { key: 'apps/android/app1.apk', path: '/tmp/app1.apk' },
    { key: 'apps/android/app2.apk', path: '/tmp/app2.apk' },
    { key: 'icons/app1-icon.png', path: '/tmp/icon1.png' },
    { key: 'icons/app2-icon.png', path: '/tmp/icon2.png' }
  ];
  
  const results = [];
  
  for (const file of files) {
    try {
      console.log(`上传文件: ${file.key}`);
      const result = await common.uploadFileToStorage(file.key, file.path);
      results.push({ key: file.key, success: true, result });
      console.log(`✅ ${file.key} 上传成功`);
      
    } catch (error) {
      results.push({ key: file.key, success: false, error: error.message });
      console.log(`❌ ${file.key} 上传失败: ${error.message}`);
    }
  }
  
  // 统计结果
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n批量上传完成: 成功 ${successful} 个，失败 ${failed} 个`);
  
  return results;
}

/**
 * 主函数 - 运行所有示例
 */
async function main() {
  console.log('🚀 Ceph 对象存储使用示例');
  console.log('================================\n');
  
  // 首先验证配置
  if (!configValidationExample()) {
    console.log('\n请先配置 Ceph 相关环境变量');
    return;
  }
  
  console.log('\n');
  
  // 运行各个示例（注意：这些示例需要实际的文件才能运行）
  // await basicUploadExample();
  // await directCephUploadExample();
  // await errorHandlingExample();
  // await batchUploadExample();
  
  console.log('\n✨ 示例代码展示完成');
  console.log('注意: 要运行实际的上传示例，请确保有相应的测试文件');
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

// 导出示例函数供其他模块使用
export {
  basicUploadExample,
  directCephUploadExample,
  configValidationExample,
  errorHandlingExample,
  batchUploadExample
};
