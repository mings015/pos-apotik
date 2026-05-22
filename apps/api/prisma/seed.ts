import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const roleNames = ['SUPER_ADMIN', 'ADMIN', 'CASHIER', 'WAREHOUSE']

  const roles = await Promise.all(
    roleNames.map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  )

  const superAdminRole = roles.find((r) => r.name === 'SUPER_ADMIN')!
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@pharmapos.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@pharmapos.com',
      password: hashedPassword,
      roleId: superAdminRole.id,
    },
  })

  console.log('Seed selesai')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
