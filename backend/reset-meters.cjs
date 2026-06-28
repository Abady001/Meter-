const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // Count meters per project
  const meters = await prisma.meter.findMany({ select: { id: true, serialNumber: true, projectId: true, status: true, installationDate: true } });
  const byProject = {};
  for (const m of meters) {
    if (!byProject[m.projectId]) byProject[m.projectId] = [];
    byProject[m.projectId].push(m);
  }
  
  console.log('=== Meters per project ===');
  for (const [pid, list] of Object.entries(byProject)) {
    const proj = await prisma.coreProject.findUnique({ where: { id: pid } }).catch(() => null);
    console.log(`${proj ? proj.projectName + ' (' + proj.projectCode + ')' : 'UNKNOWN'} | ${list.length} meters | projectId=${pid}`);
  }
  
  // Check for assignments
  const assigned = await prisma.meterAssignment.count();
  console.log(`\nMeter assignments: ${assigned}`);
  
  // Delete only unassigned meters (sync imports with no customer/unit)
  const unassignedIds = [];
  const assignedMeterIds = new Set((await prisma.meterAssignment.findMany({ select: { meterId: true } })).map(a => a.meterId));
  
  for (const m of meters) {
    if (!assignedMeterIds.has(m.id)) {
      unassignedIds.push(m.id);
    }
  }
  
  console.log(`\nUnassigned meters to delete: ${unassignedIds.length}`);
  if (unassignedIds.length > 0) {
    // Delete in batches
    for (let i = 0; i < unassignedIds.length; i += 100) {
      const batch = unassignedIds.slice(i, i + 100);
      await prisma.reading.deleteMany({ where: { meterId: { in: batch } } }).catch(() => {});
      await prisma.readingReview.deleteMany({ where: { meterId: { in: batch } } }).catch(() => {});
      await prisma.invoice.deleteMany({ where: { meterId: { in: batch } } }).catch(() => {});
      await prisma.meter.deleteMany({ where: { id: { in: batch } } });
    }
    console.log(`Deleted ${unassignedIds.length} unassigned meters`);
  }
  
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
