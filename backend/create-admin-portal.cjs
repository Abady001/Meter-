const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('admin', 10);
  let user = await prisma.coreUser.findFirst({ where: { username: 'admin' } });
  if (!user) {
    user = await prisma.coreUser.create({
      data: { username: 'admin', email: 'admin@meterpulse.com', passwordHash: hash, status: 'active', roleCode: 'super_admin', roleName: 'Super Admin' }
    });
    console.log('Admin user created:', user.id);
  } else {
    await prisma.coreUser.update({ where: { id: user.id }, data: { passwordHash: hash, status: 'active' } });
    console.log('Admin password reset for:', user.id);
  }
  const role = await prisma.coreRole.findFirst({ where: { roleCode: 'super_admin' } });
  if (role) {
    const existing = await prisma.coreUserRoleAssignment.findFirst({ where: { userId: user.id, roleId: role.id } });
    if (!existing) {
      await prisma.coreUserRoleAssignment.create({ data: { userId: user.id, roleId: role.id } });
      console.log('Admin role assignment created');
    } else {
      console.log('Admin role assignment already exists');
    }
  } else {
    console.log('super_admin role not found in core.roles');
  }
  await prisma.$disconnect();
}
main().catch(console.error);
