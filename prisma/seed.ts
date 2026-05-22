import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Services
  const services = [
    { id: 1, name: 'Service 1' },
    { id: 2, name: 'Service 2' },
    { id: 3, name: 'Service 3' },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: { name: service.name },
      create: service,
    });
  }
  console.log('Services seeded.');

  // Seed Providers
  const providers = [];
  for (let i = 1; i <= 8; i++) {
    providers.push({
      id: i,
      name: `Provider ${i}`,
      monthlyQuota: 10,
      leadsReceived: 0,
    });
  }

  for (const provider of providers) {
    await prisma.provider.upsert({
      where: { id: provider.id },
      update: {
        name: provider.name,
        monthlyQuota: provider.monthlyQuota,
        leadsReceived: provider.leadsReceived,
      },
      create: provider,
    });
  }
  console.log('Providers seeded.');

  // Seed Allocation Pointers for round-robin allocation
  for (const service of services) {
    await prisma.allocationPointer.upsert({
      where: { serviceId: service.id },
      update: {},
      create: {
        serviceId: service.id,
        pointer: 0,
      },
    });
  }
  console.log('Allocation pointers seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
