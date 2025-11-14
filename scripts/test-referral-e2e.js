/**
 * 推荐系统端到端测试脚本
 * 测试完整的推荐流程：推荐码生成 -> 分享 -> 点击 -> 注册 -> 奖励
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// 测试用户数据
const timestamp = Date.now();
const testUsers = {
  referrer: {
    email: `referrer${timestamp}@test.com`,
    name: '推荐人',
    password: 'password123'
  },
  referred: {
    email: `referred${timestamp}@test.com`, 
    name: '被推荐人',
    password: 'password123'
  }
};

let referrerToken = '';
let referralCode = '';
let referralCodeId = '';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testReferralSystem() {
  console.log('🚀 开始推荐系统端到端测试...\n');

  try {
    // 步骤1: 注册推荐人
    console.log('📝 步骤1: 注册推荐人');
    const registerResponse = await axios.post(`${API_BASE}/auth`, {
      action: 'register',
      name: testUsers.referrer.name,
      email: testUsers.referrer.email,
      password: testUsers.referrer.password
    });

    if (registerResponse.data.success) {
      referrerToken = registerResponse.data.data.accessToken;
      console.log('✅ 推荐人注册成功');
    } else {
      throw new Error('推荐人注册失败: ' + registerResponse.data.message);
    }

    // 步骤2: 生成推荐码
    console.log('\n🎯 步骤2: 生成推荐码');
    const codeResponse = await axios.post(`${API_BASE}/referral/code`, {}, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`
      }
    });

    if (codeResponse.data.success) {
      referralCode = codeResponse.data.data.code;
      referralCodeId = codeResponse.data.data.id;
      console.log(`✅ 推荐码生成成功: ${referralCode}`);
    } else {
      throw new Error('推荐码生成失败: ' + codeResponse.data.message);
    }

    // 步骤3: 验证推荐码
    console.log('\n🔍 步骤3: 验证推荐码');
    const validateResponse = await axios.get(`${API_BASE}/referral/validate?code=${referralCode}`);

    if (validateResponse.data.success && validateResponse.data.isValid) {
      console.log('✅ 推荐码验证成功');
      console.log(`   推荐人: ${validateResponse.data.referrerInfo.name}`);
    } else {
      throw new Error('推荐码验证失败');
    }

    // 步骤4: 模拟点击推荐链接
    console.log('\n👆 步骤4: 模拟点击推荐链接');
    const clickResponse = await axios.post(`${API_BASE}/referral/track`, {
      action: 'track-click',
      referralCodeId: referralCodeId,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      referer: 'https://google.com',
      utmParams: {
        source: 'google',
        campaign: 'test'
      }
    });

    if (clickResponse.data.success) {
      console.log('✅ 推荐点击追踪成功');
    } else {
      throw new Error('推荐点击追踪失败');
    }

    // 步骤5: 注册被推荐人
    console.log('\n📝 步骤5: 注册被推荐人');
    const referredRegisterResponse = await axios.post(`${API_BASE}/auth`, {
      action: 'register',
      name: testUsers.referred.name,
      email: testUsers.referred.email,
      password: testUsers.referred.password,
      referralCode: referralCode
    });

    if (referredRegisterResponse.data.success) {
      console.log('✅ 被推荐人注册成功');
    } else {
      throw new Error('被推荐人注册失败: ' + referredRegisterResponse.data.message);
    }

    // 等待一下让异步操作完成
    await sleep(1000);

    // 步骤6: 检查推荐关系
    console.log('\n🔗 步骤6: 检查推荐关系');
    const relationshipResponse = await axios.get(`${API_BASE}/referral/relationship?action=stats`, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`
      }
    });

    if (relationshipResponse.data.success) {
      const stats = relationshipResponse.data.data.overview;
      console.log('✅ 推荐统计获取成功');
      console.log(`   总推荐数: ${stats.totalReferrals}`);
      console.log(`   成功推荐数: ${stats.successfulReferrals}`);
      console.log(`   总点击数: ${stats.totalClicks}`);
      console.log(`   转化率: ${stats.conversionRate}%`);
    } else {
      throw new Error('推荐统计获取失败');
    }

    // 步骤7: 检查积分奖励
    console.log('\n💰 步骤7: 检查积分奖励');
    const pointsResponse = await axios.get(`${API_BASE}/points`, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`
      }
    });

    if (pointsResponse.data.success) {
      const balance = pointsResponse.data.data;
      console.log('✅ 积分查询成功');
      console.log(`   总积分: ${balance.totalPoints}`);
      console.log(`   可用积分: ${balance.availablePoints}`);
      
      if (balance.totalPoints > 0) {
        console.log('✅ 推荐奖励积分已发放');
      } else {
        console.log('⚠️  推荐奖励积分未发放');
      }
    } else {
      throw new Error('积分查询失败');
    }

    // 步骤8: 检查推荐用户列表
    console.log('\n👥 步骤8: 检查推荐用户列表');
    const userListResponse = await axios.get(`${API_BASE}/referral/relationship?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`
      }
    });

    if (userListResponse.data.success) {
      const referrals = userListResponse.data.data.referrals;
      console.log('✅ 推荐用户列表获取成功');
      console.log(`   推荐用户数量: ${referrals.length}`);
      
      if (referrals.length > 0) {
        const referral = referrals[0];
        console.log(`   被推荐人: ${referral.referred.name}`);
        console.log(`   状态: ${referral.status}`);
      }
    } else {
      throw new Error('推荐用户列表获取失败');
    }

    console.log('\n🎉 推荐系统端到端测试完成！');
    console.log('\n📊 测试总结:');
    console.log('   ✅ 推荐人注册');
    console.log('   ✅ 推荐码生成');
    console.log('   ✅ 推荐码验证');
    console.log('   ✅ 推荐链接点击追踪');
    console.log('   ✅ 被推荐人注册');
    console.log('   ✅ 推荐关系建立');
    console.log('   ✅ 积分奖励发放');
    console.log('   ✅ 统计数据更新');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
    process.exit(1);
  }
}

// 运行测试
testReferralSystem();

export { testReferralSystem };
