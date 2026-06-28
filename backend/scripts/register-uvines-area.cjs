/**
 * Register ABRAJ-UVENUS area in the Meter Verse database.
 * 
 * Run: node scripts/register-uvines-area.cjs
 * 
 * This registers:
 * 1. CoreArea record (AREA-8 / uvines_mall)
 * 2. CoreProject record linked to AREA-8
 * 3. Does NOT modify Symbiot in any way (READ ONLY)
 * 4. Does NOT affect existing areas
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Register ABRAJ-UVENUS Area ===\n');

  // 1. Check if area already exists
  let area = await prisma.coreArea.findFirst({ where: { areaCode: 'AREA-8' } });
  if (area) {
    console.log(`Area already exists: ${area.areaName} (${area.id})`);
  } else {
    area = await prisma.coreArea.create({
      data: {
        areaCode: 'AREA-8',
        areaName: 'Uvenus Mall',
        databaseName: 'ABRAJ_UVENUS',
        connectionString: 'Server=10.50.30.4;Database=ABRAJ_UVENUS;User Id=sa;',
        isActive: true,
      },
    });
    console.log(`Created area: ${area.areaName} (${area.id})`);
  }

  // 2. Check if project exists
  let project = await prisma.coreProject.findFirst({ where: { areaId: area.id } });
  if (project) {
    console.log(`Project already exists: ${project.projectName} (${project.id})`);
  } else {
    project = await prisma.coreProject.create({
      data: {
        areaId: area.id,
        projectCode: 'PROJ-AREA-8',
        projectName: 'ABRAJ UVENUS',
        isActive: true,
      },
    });
    console.log(`Created project: ${project.projectName} (${project.id})`);
  }

  console.log('\n=== Registration Complete ===');
  console.log(`Area: ${area.areaName} (AREA-8)`);
  console.log(`Project: ${project.projectName}`);
  console.log(`\nNext steps:`);
  console.log(`1. POST /api/v1/sync/meters/AREA-8 — sync meters from Symbiot`);
  console.log(`2. Login with area=Uvenus Mall to verify isolation`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
