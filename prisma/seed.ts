import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a SUPER_ADMIN user (no tenant - can see everything)
  const superAdminPassword = await hash('superadmin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@klickbee.com' },
    update: {},
    create: {
      email: 'superadmin@klickbee.com',
      name: 'Super Admin',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
      status: 'Active',
      tenantId: null, // No tenant for super admin
    },
  });

  console.log('✅ Created SUPER_ADMIN user:', superAdmin.email, '(password: superadmin123)');

  // Create a test tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      plan: 'pro',
      maxUsers: 10,
      active: true,
    },
  });

  console.log('✅ Created tenant:', tenant.name);

  // Create a second tenant for testing multi-tenant
  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'ACME Corporation',
      slug: 'acme-corp',
      plan: 'enterprise',
      maxUsers: 50,
      active: true,
    },
  });

  console.log('✅ Created tenant:', tenant2.name);

  // Create admin user for demo workspace
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      status: 'Active',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Created admin user:', admin.email, '(password: admin123)');

  // Create manager user
  const managerPassword = await hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@demo.com' },
    update: {},
    create: {
      email: 'manager@demo.com',
      name: 'Manager User',
      password: managerPassword,
      role: 'MANAGER',
      status: 'Active',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Created manager user:', manager.email, '(password: manager123)');

  // Create viewer user
  const viewerPassword = await hash('viewer123', 10);
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@demo.com' },
    update: {},
    create: {
      email: 'viewer@demo.com',
      name: 'Viewer User',
      password: viewerPassword,
      role: 'VIEWER',
      status: 'Active',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Created viewer user:', viewer.email, '(password: viewer123)');

  // Create admin for ACME corp
  const acmeAdminPassword = await hash('acme123', 10);
  const acmeAdmin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      name: 'ACME Admin',
      password: acmeAdminPassword,
      role: 'ADMIN',
      status: 'Active',
      tenantId: tenant2.id,
    },
  });

  console.log('✅ Created ACME admin user:', acmeAdmin.email, '(password: acme123)');

  console.log('\n🎉 Seeding completed!');
  console.log('\n📋 Test Accounts:');
  console.log('┌─────────────────────────────────────────────────────────────────────────┐');
  console.log('│ SUPER ADMIN (can see ALL tenants and users)                            │');
  console.log('│ - superadmin@klickbee.com / superadmin123                              │');
  console.log('├─────────────────────────────────────────────────────────────────────────┤');
  console.log('│ Demo Workspace                                                          │');
  console.log('│ - admin@demo.com / admin123 (Admin)                                     │');
  console.log('│ - manager@demo.com / manager123 (Manager)                               │');
  console.log('│ - viewer@demo.com / viewer123 (Viewer)                                  │');
  console.log('├─────────────────────────────────────────────────────────────────────────┤');
  console.log('│ ACME Corporation                                                        │');
  console.log('│ - admin@acme.com / acme123 (Admin)                                      │');
  console.log('└─────────────────────────────────────────────────────────────────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
