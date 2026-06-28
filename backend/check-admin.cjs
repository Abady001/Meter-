const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.coreUser.findFirst({ where: { username: 'admin' } });
  if (!user) { console.log('User not found'); return; }
  console.log('User found:', user.id, user.username, user.email, user.status);
  const valid = await bcrypt.compare('admin', user.passwordHash);
  console.log('Password valid:', valid);
  console.log('Hash length:', user.passwordHash.length);
  console.log('Hash prefix:', user.passwordHash.substring(0, 10));
  const assignments = await prisma.coreUserRoleAssignment.findMany({ where: { userId: user.id }, include: { role: true } });
  console.log('Role assignments:', assignments.length);
  assignments.forEach(a => console.log('  - Role:', a.role.roleCode, a.role.roleName));
  await prisma.$disconnect();
}
main().catch(console.error);
