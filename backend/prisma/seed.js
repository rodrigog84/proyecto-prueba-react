// Seed: crea el usuario admin inicial con contraseña hasheada.
// En PHP harías: INSERT INTO users ... con password_hash($pass, PASSWORD_BCRYPT)
// Aquí hacemos lo mismo pero desde Node.
//
// Ejecutar con: npm run db:seed

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('1234', 10);

  // upsert = INSERT ... ON CONFLICT DO UPDATE (equivalente en SQL estándar)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@miapp.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Usuario admin creado:', admin.username, '| id:', admin.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
