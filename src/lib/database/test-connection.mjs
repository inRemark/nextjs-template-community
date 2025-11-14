import { PrismaClient } from '@prisma/client';
import { logger } from '@logger';
const prisma = new PrismaClient();

async function testConnection() {
  try {
    // test connection
    await prisma.$connect();
    logger.success('✅ successfully connected to the database.');

    // Get all table names
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    logger.info('📋 Tables in the database:');
    for (const table of tables) {
      logger.info(`  - ${table.table_name}`);
    }

    // Check if specific tables exist
    const requiredTables = [
      'users',
      'customers',
      'customer_groups',
      'customer_group_members',
      'email_templates',
      'template_variables',
      'mail_tasks',
      'email_jobs',
      'email_attachments',
      'email_stats',
      'email_open_tracking',
      'email_click_tracking',
      'unsubscribe_records'
    ];

    logger.info('\n🔍 Check if specific tables exist:');
    for (const table of requiredTables) {
      const exists = tables.some((t) => t.table_name === table);
      logger.info(`  ${exists ? '✅' : '❌'} ${table}`);
    }

    // Test creating a user
    logger.info('\n📝 Test creating user...');
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password_here',
      }
    });
    logger.info(`  ✅ User created successfully: ${user.id}`);

    // Query user
    const foundUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    logger.info(`  🔍 Query user successfully: ${foundUser?.name}`);

    // Cleanup test data
    await prisma.user.delete({
      where: { id: user.id }
    });
    logger.info('  🧹 Cleanup test data successfully.');

    await prisma.$disconnect();
    logger.info('\n🎉 Database connection and schema validation completed!');
  } catch (error) {
    logger.error('❌ Database test failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

await testConnection();