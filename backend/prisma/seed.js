const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // Admin
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  // Doctor
  await prisma.user.upsert({
    where: { username: 'dokter' },
    update: {},
    create: {
      username: 'dokter',
      password,
      name: 'Dr. Budi Santoso',
      role: 'DOCTOR',
    },
  });

  // Receptionist
  await prisma.user.upsert({
    where: { username: 'petugas' },
    update: {},
    create: {
      username: 'petugas',
      password,
      name: 'Siti Pendaftaran',
      role: 'RECEPTIONIST',
    },
  });

  // Polyclinics
  const polis = [
    { name: 'Poli Umum', prefix: 'A' },
    { name: 'Poli Gigi', prefix: 'B' },
    { name: 'Poli Anak', prefix: 'C' }
  ];
  for (const poli of polis) {
    await prisma.polyclinic.create({
      data: poli
    });
  }

  console.log('Database has been seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
