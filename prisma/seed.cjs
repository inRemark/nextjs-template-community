const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for test users (password: password123)
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create 3 test users
  const users = await Promise.all([
    // 1. Admin user - 管理后台权限
    prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        email: 'admin@test.com',
        name: '管理员',
        role: 'ADMIN',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    }),
    // 2. Company user - Console 控制台用户
    prisma.user.upsert({
      where: { email: 'company@test.com' },
      update: {},
      create: {
        email: 'company@test.com',
        name: '企业用户',
        role: 'USER',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    }),
    // 3. Regular user - Profile 个人中心用户
    prisma.user.upsert({
      where: { email: 'user@test.com' },
      update: {},
      create: {
        email: 'user@test.com',
        name: '普通用户',
        role: 'USER',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    }),
  ]);

  console.log('✅ Created users:');
  console.log('   - admin@test.com (password: password123) - 管理员');
  console.log('   - company@test.com (password: password123) - 企业用户');
  console.log('   - user@test.com (password: password123) - 普通用户');

  // Create user points for all users
  const userPoints = await Promise.all([
    prisma.userPoints.upsert({
      where: { userId: users[0].id },
      update: {},
      create: {
        userId: users[0].id,
        totalPoints: 1000,
        availablePoints: 1000,
        spentPoints: 0,
      },
    }),
    prisma.userPoints.upsert({
      where: { userId: users[1].id },
      update: {},
      create: {
        userId: users[1].id,
        totalPoints: 250,
        availablePoints: 200,
        spentPoints: 50,
      },
    }),
    prisma.userPoints.upsert({
      where: { userId: users[2].id },
      update: {},
      create: {
        userId: users[2].id,
        totalPoints: 100,
        availablePoints: 80,
        spentPoints: 20,
      },
    }),
  ]);

  console.log('✅ Created user points:', userPoints.length);

  // Create test articles
  const articles = await Promise.all([
    // Admin's articles
    prisma.article.upsert({
      where: { slug: 'welcome-to-nextjs-template' },
      update: {},
      create: {
        title: '欢迎使用 Next.js 模板项目',
        slug: 'welcome-to-nextjs-template',
        content: '<h1>欢迎使用 Next.js 模板项目</h1><p>这是一个功能完整的 Next.js 15 + React 19 开发模板，包含了认证、权限、通知、积分、推荐等常用功能模块。</p><h2>主要特性</h2><ul><li>基于 Next.js 15 App Router</li><li>TypeScript 严格类型检查</li><li>Prisma ORM + PostgreSQL</li><li>NextAuth.js v5 认证</li><li>Tailwind CSS + Radix UI</li></ul>',
        excerpt: '这是一个功能完整的 Next.js 15 + React 19 开发模板，包含了认证、权限、通知、积分、推荐等常用功能模块。',
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
        authorId: users[0].id,
        published: true,
        publishedAt: new Date('2025-10-26'),
        tags: ['Next.js', 'React', 'TypeScript', '模板'],
        viewCount: 156,
      },
    }),
    prisma.article.upsert({
      where: { slug: 'features-module-guide' },
      update: {},
      create: {
        title: 'Features 模块开发指南',
        slug: 'features-module-guide',
        content: '<h1>Features 模块开发指南</h1><p>本模板采用 Features 模块化架构，每个业务功能都是独立的模块。</p><h2>标准目录结构</h2><pre>features/[module]/\n  ├── services/      # 业务逻辑服务（必需）\n  ├── types/         # 类型定义（必需）\n  ├── validators/    # 数据验证（可选）\n  ├── components/    # UI 组件（可选）\n  ├── hooks/         # React Hooks（可选）\n  ├── index.ts       # 统一导出\n  └── README.md      # 模块文档</pre>',
        excerpt: '本模板采用 Features 模块化架构，每个业务功能都是独立的模块。了解如何创建标准化的业务模块。',
        coverImage: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec',
        authorId: users[0].id,
        published: true,
        publishedAt: new Date('2025-10-25'),
        tags: ['开发指南', 'Features', '模块化'],
        viewCount: 89,
      },
    }),
    // Company user's article
    prisma.article.upsert({
      where: { slug: 'authentication-setup' },
      update: {},
      create: {
        title: '如何配置身份认证',
        slug: 'authentication-setup',
        content: '<h1>如何配置身份认证</h1><p>本模板使用 NextAuth.js v5 提供强大的身份认证功能。</p><h2>支持的认证方式</h2><ul><li>邮箱密码登录</li><li>Google OAuth</li><li>GitHub OAuth</li><li>微信 OAuth</li></ul><h2>配置步骤</h2><ol><li>设置环境变量</li><li>配置 OAuth 提供商</li><li>自定义登录页面</li><li>实现权限控制</li></ol>',
        excerpt: '了解如何在模板项目中配置和使用 NextAuth.js v5 进行身份认证，支持多种 OAuth 登录方式。',
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
        authorId: users[1].id,
        published: true,
        publishedAt: new Date('2025-10-24'),
        tags: ['认证', 'NextAuth', 'OAuth'],
        viewCount: 124,
      },
    }),
    // Regular user's draft article
    prisma.article.upsert({
      where: { slug: 'my-first-blog-draft' },
      update: {},
      create: {
        title: '我的第一篇博客（草稿）',
        slug: 'my-first-blog-draft',
        content: '<p>这是我在这个平台上的第一篇博客文章，目前还在编辑中...</p>',
        excerpt: '这是一篇草稿文章，展示文章的草稿状态。',
        authorId: users[2].id,
        published: false,
        tags: ['测试', '草稿'],
        viewCount: 0,
      },
    }),
    // Admin's technical article
    prisma.article.upsert({
      where: { slug: 'prisma-best-practices' },
      update: {},
      create: {
        title: 'Prisma ORM 最佳实践',
        slug: 'prisma-best-practices',
        content: '<h1>Prisma ORM 最佳实践</h1><p>分享在生产环境中使用 Prisma ORM 的经验和技巧。</p><h2>Schema 设计</h2><ul><li>合理使用索引</li><li>设置级联删除</li><li>枚举类型的应用</li></ul><h2>查询优化</h2><ul><li>使用 include 和 select</li><li>避免 N+1 查询</li><li>批量操作优化</li></ul>',
        excerpt: '分享在生产环境中使用 Prisma ORM 的经验和技巧，包括 Schema 设计和查询优化。',
        coverImage: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159',
        authorId: users[0].id,
        published: true,
        publishedAt: new Date('2025-10-23'),
        tags: ['Prisma', 'Database', '最佳实践'],
        viewCount: 67,
      },
    }),
  ]);

  console.log('✅ Created articles:', articles.length);

  // Create referral codes
  const referralCodes = await Promise.all([
    prisma.referralCode.upsert({
      where: { code: 'ADMIN2025' },
      update: { isActive: true },
      create: {
        userId: users[0].id,
        code: 'ADMIN2025',
        isActive: true,
      },
    }),
    prisma.referralCode.upsert({
      where: { code: 'COMPANY2025' },
      update: { isActive: true },
      create: {
        userId: users[1].id,
        code: 'COMPANY2025',
        isActive: true,
      },
    }),
    prisma.referralCode.upsert({
      where: { code: 'USER2025' },
      update: { isActive: true },
      create: {
        userId: users[2].id,
        code: 'USER2025',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Created referral codes:', referralCodes.map(r => r.code));

  // Create referral relationship (user referred by company user)
  // First delete existing referral if any
  await prisma.referral.deleteMany({
    where: { referredUserId: users[2].id },
  });
  
  const referral = await prisma.referral.create({
    data: {
      referrerId: users[1].id,
      referredUserId: users[2].id,
      referralCodeId: referralCodes[1].id,
      status: 'COMPLETED',
    },
  });

  console.log('✅ Created referral relationship');

  // Create points transactions
  const pointsTransactions = await Promise.all([
    prisma.pointsTransaction.create({
      data: {
        userId: users[0].id,
        amount: 1000,
        type: 'ADMIN_ADJUSTMENT',
        description: '管理员初始积分',
      },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId: users[1].id,
        amount: 100,
        type: 'EARNED_REFERRAL_REGISTER',
        description: '推荐用户注册奖励',
        relatedId: referral.id,
      },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId: users[1].id,
        amount: 50,
        type: 'EARNED_REFERRAL_FIRST_LOGIN',
        description: '被推荐用户首次登录奖励',
        relatedId: referral.id,
      },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId: users[1].id,
        amount: -50,
        type: 'SPENT_FEATURE',
        description: '兑换高级功能',
      },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId: users[2].id,
        amount: 50,
        type: 'ADMIN_ADJUSTMENT',
        description: '注册奖励',
      },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId: users[2].id,
        amount: 30,
        type: 'ADMIN_ADJUSTMENT',
        description: '首次登录奖励',
      },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId: users[2].id,
        amount: -20,
        type: 'SPENT_FEATURE',
        description: '兑换功能使用',
      },
    }),
  ]);

  console.log('✅ Created points transactions:', pointsTransactions.length);

  // Create user activities
  const activities = await Promise.all([
    prisma.userActivity.create({
      data: {
        userId: users[1].id,
        activityType: 'LOGIN',
        targetType: 'system',
        metadata: {
          device: 'Chrome/MacOS',
          ip: '127.0.0.1',
        },
      },
    }),
    prisma.userActivity.create({
      data: {
        userId: users[1].id,
        activityType: 'SUBMIT_FORM',
        targetType: 'referral',
        targetId: referralCodes[1].id,
        metadata: {
          code: referralCodes[1].code,
          platform: 'email',
        },
      },
    }),
    prisma.userActivity.create({
      data: {
        userId: users[2].id,
        activityType: 'UPDATE_PROFILE',
        targetType: 'profile',
        targetId: users[2].id,
        metadata: {
          fields: ['name', 'avatar'],
        },
      },
    }),
  ]);

  console.log('✅ Created user activities:', activities.length);

  // Create notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[1].id,
        type: 'SUCCESS',
        category: 'SYSTEM',
        priority: 'MEDIUM',
        title: '推荐成功',
        message: '您推荐的用户已成功注册，获得100积分奖励',
        metadata: {
          referralId: referral.id,
          points: 100,
        },
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[2].id,
        type: 'SUCCESS',
        category: 'SYSTEM',
        priority: 'MEDIUM',
        title: '积分到账',
        message: '注册成功，获得50积分奖励',
        metadata: {
          points: 50,
          reason: 'signup',
        },
        readAt: new Date(),
      },
    }),
  ]);

  console.log('✅ Created notifications:', notifications.length);

  // Create notification settings
  const notificationSettings = await Promise.all([
    prisma.notificationSettings.upsert({
      where: { userId: users[0].id },
      update: {},
      create: {
        userId: users[0].id,
        emailEnabled: true,
        browserEnabled: false,
        mobileEnabled: false,
      },
    }),
    prisma.notificationSettings.upsert({
      where: { userId: users[1].id },
      update: {},
      create: {
        userId: users[1].id,
        emailEnabled: true,
        browserEnabled: true,
        mobileEnabled: true,
        mobilePush: true,
      },
    }),
    prisma.notificationSettings.upsert({
      where: { userId: users[2].id },
      update: {},
      create: {
        userId: users[2].id,
        emailEnabled: false,
        browserEnabled: true,
        mobileEnabled: true,
        mobilePush: true,
      },
    }),
  ]);

  console.log('✅ Created notification settings:', notificationSettings.length);

  // Create referral stats
  const referralStats = await Promise.all([
    prisma.referralStats.upsert({
      where: { 
        userId_period_periodDate: {
          userId: users[0].id,
          period: 'DAILY',
          periodDate: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      update: {},
      create: {
        userId: users[0].id,
        period: 'DAILY',
        periodDate: new Date(new Date().setHours(0, 0, 0, 0)),
        clicks: 0,
        conversions: 0,
        rewards: 0,
        conversionRate: 0,
      },
    }),
    prisma.referralStats.upsert({
      where: { 
        userId_period_periodDate: {
          userId: users[1].id,
          period: 'DAILY',
          periodDate: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      update: {},
      create: {
        userId: users[1].id,
        period: 'DAILY',
        periodDate: new Date(new Date().setHours(0, 0, 0, 0)),
        clicks: 0,
        conversions: 1,
        rewards: 150,
        conversionRate: 1.0,
      },
    }),
    prisma.referralStats.upsert({
      where: { 
        userId_period_periodDate: {
          userId: users[2].id,
          period: 'DAILY',
          periodDate: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      update: {},
      create: {
        userId: users[2].id,
        period: 'DAILY',
        periodDate: new Date(new Date().setHours(0, 0, 0, 0)),
        clicks: 0,
        conversions: 0,
        rewards: 0,
        conversionRate: 0,
      },
    }),
  ]);

  console.log('✅ Created referral stats:', referralStats.length);

  // Create email send tasks
  const emailTasks = await Promise.all([
    prisma.emailSendTask.create({
      data: {
        to: users[1].email,
        subject: '欢迎使用模板系统',
        content: '<h1>欢迎！</h1><p>您已成功注册，推荐码：COMPANY2025</p>',
        textContent: '欢迎！您已成功注册，推荐码：COMPANY2025',
        templateId: 'welcome',
        variables: { userName: users[1].name, referralCode: 'COMPANY2025' },
        priority: 'NORMAL',
        status: 'SENT',
        sentAt: new Date(),
      },
    }),
    prisma.emailSendTask.create({
      data: {
        to: users[1].email,
        subject: '推荐奖励到账通知',
        content: '<h1>奖励通知</h1><p>恭喜您获得推荐奖励100积分！</p>',
        textContent: '恭喜您获得推荐奖励100积分！',
        templateId: 'reward',
        variables: { userName: users[1].name, points: 100 },
        priority: 'HIGH',
        status: 'SENT',
        sentAt: new Date(),
      },
    }),
    prisma.emailSendTask.create({
      data: {
        to: users[0].email,
        subject: '系统通知',
        content: '<h1>系统通知</h1><p>您有新的管理任务待处理。</p>',
        textContent: '您有新的管理任务待处理。',
        templateId: 'system',
        variables: { userName: users[0].name },
        priority: 'NORMAL',
        status: 'PENDING',
      },
    }),
  ]);

  console.log('✅ Created email send tasks:', emailTasks.length);

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'theme-clone' },
      update: {},
      create: {
        name: 'Theme Clone',
        slug: 'theme-clone',
        description: '克隆任意网站主题设计，自动提取颜色、字体、布局等设计要素',
        featureType: 'THEME_CLONE',
        isActive: true,
        metadata: {
          features: [
            '自动提取网站主题颜色',
            '识别字体和排版风格',
            '分析布局和间距',
            '生成可复用的设计系统',
          ],
          limits: {
            maxUrls: 1,
            timeout: 30,
          },
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'screenshot' },
      update: {},
      create: {
        name: 'Web Screenshot',
        slug: 'screenshot',
        description: '高质量网页截图服务，支持全页截图、移动端视图、自定义尺寸',
        featureType: 'SCREENSHOT',
        isActive: true,
        metadata: {
          features: [
            '全页面截图',
            '移动端/桌面端视图',
            '自定义分辨率',
            '多种格式导出',
          ],
          limits: {
            maxUrls: 1,
            timeout: 30,
          },
        },
      },
    }),
  ]);

  console.log('✅ Created products:', products.length);

  // Create product prices
  const productPrices = await Promise.all([
    // Theme Clone - USD
    prisma.productPrice.create({
      data: {
        productId: products[0].id,
        amount: 9.99,
        currency: 'USD',
        region: 'global',
        type: 'ONE_TIME',
        isActive: true,
      },
    }),
    // Theme Clone - CNY
    prisma.productPrice.create({
      data: {
        productId: products[0].id,
        amount: 68,
        currency: 'CNY',
        region: 'cn',
        type: 'ONE_TIME',
        isActive: true,
      },
    }),
    // Screenshot - USD
    prisma.productPrice.create({
      data: {
        productId: products[1].id,
        amount: 4.99,
        currency: 'USD',
        region: 'global',
        type: 'ONE_TIME',
        isActive: true,
      },
    }),
    // Screenshot - CNY
    prisma.productPrice.create({
      data: {
        productId: products[1].id,
        amount: 35,
        currency: 'CNY',
        region: 'cn',
        type: 'ONE_TIME',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Created product prices:', productPrices.length);

  // ===== Orders / Payments / Invoices / Logs Seed (12 items) =====
  function genOrderNumber(i) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `ORD${y}${m}${d}${String(i + 1).padStart(6, '0')}`;
  }
  function genInvoiceNumber(i) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `INV${y}${m}${String(i + 1).padStart(6, '0')}`;
  }

  // Create 10 more test products to reach ~12 total
  const extraProducts = await Promise.all(
    Array.from({ length: 10 }).map((_, idx) => {
      const n = idx + 1;
      const slug = `test-product-${n}`;
      const featureType = n % 2 === 0 ? 'THEME_CLONE' : 'SCREENSHOT';
      return prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          name: `Test Product ${n}`,
          slug,
          description: '测试产品用于订单与支付分页测试',
          featureType,
          isActive: true,
          metadata: { index: n },
        },
      });
    })
  );
  console.log('✅ Created extra products:', extraProducts.length);

  // Create price for each extra product (USD)
  const extraPrices = await Promise.all(
    extraProducts.map((p, idx) =>
      prisma.productPrice.create({
        data: {
          productId: p.id,
          amount: 5 + idx,
          currency: 'USD',
          region: 'global',
          type: 'ONE_TIME',
          isActive: true,
        },
      })
    )
  );
  console.log('✅ Created extra product prices:', extraPrices.length);

  const allProducts = [...products, ...extraProducts];

  const methods = ['STRIPE', 'ALIPAY', 'WECHAT'];
  const statusCycle = ['SUCCESS','FAILED','CANCELLED','REFUNDED','PROCESSING','SUCCESS','SUCCESS','FAILED','REFUNDED','CANCELLED','SUCCESS','PROCESSING'];

  const orders = [];
  const payments = [];
  const invoices = [];
  for (let i = 0; i < 12; i++) {
    const user = users[i % users.length];
    const product = allProducts[i % allProducts.length];
    const usdPrice = await prisma.productPrice.findFirst({ where: { productId: product.id, currency: 'USD' } });
    const amount = usdPrice ? usdPrice.amount : 9.99;

    const order = await prisma.order.create({
      data: {
        orderNumber: genOrderNumber(i),
        userId: user.id,
        productId: product.id,
        amount,
        currency: 'USD',
        discountAmount: 0,
        finalAmount: amount,
        status: 'PENDING',
        featureData: { seed: true, idx: i + 1 },
      },
    });
    orders.push(order);

    const method = methods[i % methods.length];
    const status = statusCycle[i % statusCycle.length];

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: method,
        paymentGateway: method.toLowerCase(),
        amount: order.finalAmount,
        currency: order.currency,
        status,
        transactionId: status === 'SUCCESS' ? `TX-${order.orderNumber}` : null,
        paymentIntentId: method === 'STRIPE' ? `pi_${String(i + 1).padStart(8, '0')}` : null,
        checkoutUrl: method === 'STRIPE' ? `https://pay.example/checkout/${order.orderNumber}` : null,
        redirectUrl: `https://app.example/orders/${order.id}`,
        errorMessage: status === 'FAILED' ? 'Test payment failed' : null,
        paidAt: status === 'SUCCESS' ? new Date() : null,
      },
    });
    payments.push(payment);

    // Update order status based on payment
    if (status === 'SUCCESS') {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'PAID', paidAt: new Date() } });
      const inv = await prisma.invoice.create({
        data: {
          invoiceNumber: genInvoiceNumber(i),
          orderId: order.id,
          userId: user.id,
          amount: order.finalAmount,
          currency: order.currency,
          taxAmount: 0,
          billingName: user.name || user.email,
          billingEmail: user.email,
          status: 'ISSUED',
          issuedAt: new Date(),
        },
      });
      invoices.push(inv);
    } else if (status === 'REFUNDED') {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'REFUNDED' } });
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
    }

    // Write system logs
    await prisma.systemLog.create({
      data: {
        type: 'PAYMENT_WEBHOOK',
        level: status === 'FAILED' ? 'ERROR' : status === 'PROCESSING' ? 'INFO' : 'INFO',
        message: `${method} payment ${status.toLowerCase()} for ${order.orderNumber}`,
        url: `/api/payments/${method.toLowerCase()}/webhook`,
        method: 'POST',
        status: status === 'FAILED' ? 500 : 200,
        source: method.toLowerCase(),
        userId: user.id,
        context: { orderNumber: order.orderNumber, paymentStatus: status },
      },
    });
  }

  console.log('✅ Created orders:', orders.length);
  console.log('✅ Created payments:', payments.length);
  console.log('✅ Created invoices:', invoices.length);
  console.log('✅ Created logs (payment webhooks):', 12);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - ${users.length} users (admin, company, user)`);
  console.log(`   - ${userPoints.length} user points accounts`);
  console.log(`   - ${referralCodes.length} referral codes`);
  console.log(`   - ${pointsTransactions.length} points transactions`);
  console.log(`   - ${activities.length} user activities`);
  console.log(`   - ${notifications.length} notifications`);
  console.log(`   - ${notificationSettings.length} notification settings`);
  console.log(`   - ${referralStats.length} referral stats`);
  console.log(`   - ${emailTasks.length} email send tasks`);
  console.log(`   - ${products.length} products`);
  console.log(`   - ${productPrices.length} product prices`);
  console.log('\n💡 Test Accounts:');
  console.log('   admin@test.com / password123 - 管理后台访问');
  console.log('   company@test.com / password123 - Console 控制台');
  console.log('   user@test.com / password123 - Profile 个人中心');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
