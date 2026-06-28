const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.coreUser.findFirst({ where: { username: 'admin' } });
  if (!user) { console.log('User not found'); return; }
  console.log('User:', user.id, user.username, user.email, user.status);
  const roles = await prisma.coreRole.findMany();
  console.log('Roles in DB:', roles.length);
  roles.forEach(r => console.log('  role:', r.id, r.roleCode, r.roleName, r.isSystem));
  const assignments = await prisma.coreUserRoleAssignment.findMany({ where: { userId: user.id } });
  console.log('Assignments:', assignments.length);
  assignments.forEach(a => {
    console.log('  assignment:', a.id, 'userId:', a.userId, 'roleId:', a.roleId, 'areaId:', a.areaId);
  });
  await prisma.$disconnect();
}
main().catch(console.error);
