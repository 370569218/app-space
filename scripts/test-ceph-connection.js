#!/usr/bin/env node

/**
 * Ceph 对象存储连接测试脚本
 * 用于验证 Ceph 配置是否正确
 * 
 * 使用方法:
 * node scripts/test-ceph-connection.js
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// 从环境变量读取配置
const config = {
  accessKeyId: process.env.CEPH_ACCESS_KEY_ID,
  secretAccessKey: process.env.CEPH_SECRET_ACCESS_KEY,
  endpoint: process.env.CEPH_ENDPOINT,
  bucketName: process.env.CEPH_BUCKET_NAME,
  region: process.env.CEPH_REGION || 'us-east-1',
  prefix: process.env.CEPH_PREFIX || ''
};

console.log('🔧 Ceph 对象存储连接测试');
console.log('================================');

// 验证配置
function validateConfig() {
  const required = ['accessKeyId', 'secretAccessKey', 'endpoint', 'bucketName'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.error('❌ 缺少必要的配置项:');
    missing.forEach(key => {
      console.error(`   - CEPH_${key.toUpperCase()}`);
    });
    console.error('\n请设置相应的环境变量后重试。');
    process.exit(1);
  }
  
  console.log('✅ 配置验证通过');
  console.log(`   - Endpoint: ${config.endpoint}`);
  console.log(`   - Bucket: ${config.bucketName}`);
  console.log(`   - Region: ${config.region}`);
  console.log(`   - Prefix: ${config.prefix || '(未设置)'}`);
  console.log('');
}

// 配置 AWS SDK
function configureAWS() {
  AWS.config.update({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
    s3ForcePathStyle: true,
    endpoint: config.endpoint
  });
  
  return new AWS.S3({
    params: { Bucket: config.bucketName },
    endpoint: config.endpoint,
    s3ForcePathStyle: true
  });
}

// 测试连接
async function testConnection(s3) {
  console.log('🔗 测试连接...');
  
  try {
    const result = await s3.headBucket({ Bucket: config.bucketName }).promise();
    console.log('✅ 连接成功');
    return true;
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    
    if (error.code === 'NoSuchBucket') {
      console.error('   存储桶不存在，请先创建存储桶');
    } else if (error.code === 'Forbidden') {
      console.error('   访问被拒绝，请检查访问密钥权限');
    } else if (error.code === 'NetworkingError') {
      console.error('   网络错误，请检查 endpoint 地址是否正确');
    }
    
    return false;
  }
}

// 测试上传
async function testUpload(s3) {
  console.log('📤 测试文件上传...');
  
  const testContent = `Ceph 测试文件\n创建时间: ${new Date().toISOString()}`;
  const testKey = config.prefix ? `${config.prefix}/test-file.txt` : 'test-file.txt';
  
  try {
    const result = await s3.upload({
      Key: testKey,
      Body: testContent,
      ACL: 'public-read',
      ContentType: 'text/plain'
    }).promise();
    
    console.log('✅ 上传成功');
    console.log(`   - Key: ${testKey}`);
    console.log(`   - ETag: ${result.ETag}`);
    console.log(`   - Location: ${result.Location}`);
    
    return testKey;
  } catch (error) {
    console.error('❌ 上传失败:', error.message);
    return null;
  }
}

// 测试下载
async function testDownload(s3, key) {
  console.log('📥 测试文件下载...');
  
  try {
    const result = await s3.getObject({ Key: key }).promise();
    const content = result.Body.toString();
    
    console.log('✅ 下载成功');
    console.log(`   - 文件大小: ${result.ContentLength} bytes`);
    console.log(`   - 内容类型: ${result.ContentType}`);
    console.log(`   - 文件内容: ${content.substring(0, 50)}...`);
    
    return true;
  } catch (error) {
    console.error('❌ 下载失败:', error.message);
    return false;
  }
}

// 清理测试文件
async function cleanup(s3, key) {
  console.log('🧹 清理测试文件...');
  
  try {
    await s3.deleteObject({ Key: key }).promise();
    console.log('✅ 清理完成');
  } catch (error) {
    console.error('⚠️  清理失败:', error.message);
  }
}

// 主函数
async function main() {
  try {
    // 验证配置
    validateConfig();
    
    // 配置 AWS SDK
    const s3 = configureAWS();
    
    // 测试连接
    const connected = await testConnection(s3);
    if (!connected) {
      process.exit(1);
    }
    
    // 测试上传
    const uploadedKey = await testUpload(s3);
    if (!uploadedKey) {
      process.exit(1);
    }
    
    // 测试下载
    const downloaded = await testDownload(s3, uploadedKey);
    if (!downloaded) {
      process.exit(1);
    }
    
    // 清理测试文件
    await cleanup(s3, uploadedKey);
    
    console.log('');
    console.log('🎉 所有测试通过！Ceph 对象存储配置正确。');
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = { main, validateConfig, configureAWS, testConnection, testUpload, testDownload, cleanup };
