import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // ── Roles ──────────────────────────────────────────────────────────────────
  const roleNames = ['SUPER_ADMIN', 'ADMIN', 'CASHIER', 'WAREHOUSE']
  const roles = await Promise.all(
    roleNames.map((name) =>
      prisma.role.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  )

  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r]))

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = [
    { name: 'Super Admin', email: 'admin@pharmapos.com', password: 'admin123', role: 'SUPER_ADMIN' },
    { name: 'Ahmad Fauzi', email: 'admin2@pharmapos.com', password: 'admin123', role: 'ADMIN' },
    { name: 'Siti Rahayu', email: 'kasir@pharmapos.com', password: 'kasir123', role: 'CASHIER' },
    { name: 'Budi Santoso', email: 'gudang@pharmapos.com', password: 'gudang123', role: 'WAREHOUSE' },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: await bcrypt.hash(u.password, 10),
        roleId: roleMap[u.role].id,
      },
    })
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  const categoryData = [
    { name: 'Obat Bebas', description: 'Obat yang dapat dibeli tanpa resep dokter' },
    { name: 'Obat Keras', description: 'Obat yang hanya dapat dibeli dengan resep dokter' },
    { name: 'Obat Bebas Terbatas', description: 'Obat bebas dengan batasan tertentu' },
    { name: 'Suplemen & Vitamin', description: 'Suplemen kesehatan dan multivitamin' },
    { name: 'Alat Kesehatan', description: 'Peralatan dan perlengkapan kesehatan' },
    { name: 'Herbal & Tradisional', description: 'Obat herbal dan jamu tradisional' },
    { name: 'Produk Bayi', description: 'Produk perawatan dan kesehatan bayi' },
    { name: 'Kosmetik Medis', description: 'Produk perawatan kulit dan kecantikan medis' },
  ]

  const categories = await Promise.all(
    categoryData.map((c) =>
      prisma.category.upsert({ where: { name: c.name }, update: {}, create: c }),
    ),
  )

  const catMap = Object.fromEntries(categories.map((c) => [c.name, c]))

  // ── Units ──────────────────────────────────────────────────────────────────
  const unitData = [
    { name: 'Tablet', symbol: 'tab' },
    { name: 'Kapsul', symbol: 'kap' },
    { name: 'Strip', symbol: 'strip' },
    { name: 'Box', symbol: 'box' },
    { name: 'Botol', symbol: 'btl' },
    { name: 'Tube', symbol: 'tube' },
    { name: 'Sachet', symbol: 'sach' },
    { name: 'Ampul', symbol: 'amp' },
    { name: 'Vial', symbol: 'vial' },
    { name: 'Pcs', symbol: 'pcs' },
  ]

  const units = await Promise.all(
    unitData.map((u) =>
      prisma.unit.upsert({ where: { name: u.name }, update: {}, create: u }),
    ),
  )

  const unitMap = Object.fromEntries(units.map((u) => [u.name, u]))

  // ── Suppliers ──────────────────────────────────────────────────────────────
  const supplierData = [
    {
      name: 'PT Kimia Farma',
      phone: '021-5551234',
      email: 'order@kimiafarma.co.id',
      address: 'Jl. Veteran No.9, Jakarta Pusat',
    },
    {
      name: 'PT Kalbe Farma',
      phone: '021-4287088',
      email: 'order@kalbe.co.id',
      address: 'Jl. Let. Jend. Suprapto Kav.4, Jakarta Pusat',
    },
    {
      name: 'PT Dexa Medica',
      phone: '0711-537500',
      email: 'info@dexa-medica.com',
      address: 'Jl. Jend. Bambang Utoyo, Palembang',
    },
    {
      name: 'PT Sanbe Farma',
      phone: '022-6040868',
      email: 'info@sanbe.com',
      address: 'Jl. Industri No.1, Leuwigajah, Bandung',
    },
    {
      name: 'PT Fahrenheit',
      phone: '021-5551122',
      email: 'sales@fahrenheit.co.id',
      address: 'Jl. Panjang No.5, Jakarta Barat',
    },
  ]

  const suppliers = await Promise.all(
    supplierData.map(async (s) => {
      const existing = await prisma.supplier.findFirst({ where: { name: s.name } })
      return existing ?? prisma.supplier.create({ data: s })
    }),
  )

  const supMap = Object.fromEntries(suppliers.map((s) => [s.name, s]))

  // ── Products ───────────────────────────────────────────────────────────────
  const productData = [
    {
      code: 'OBB-001',
      name: 'Paracetamol 500mg',
      category: 'Obat Bebas',
      unit: 'Strip',
      supplier: 'PT Kimia Farma',
      purchasePrice: 3500,
      sellingPrice: 5000,
      stock: 150,
      minimumStock: 20,
      description: 'Analgesik dan antipiretik untuk meredakan demam dan nyeri ringan',
    },
    {
      code: 'OBB-002',
      name: 'Antasida Doen',
      category: 'Obat Bebas',
      unit: 'Strip',
      supplier: 'PT Kimia Farma',
      purchasePrice: 4000,
      sellingPrice: 6000,
      stock: 80,
      minimumStock: 15,
      description: 'Antasida untuk meredakan maag dan gangguan pencernaan',
    },
    {
      code: 'OBB-003',
      name: 'OBH Combi Batuk Berdahak',
      category: 'Obat Bebas',
      unit: 'Botol',
      supplier: 'PT Kalbe Farma',
      purchasePrice: 18000,
      sellingPrice: 25000,
      stock: 60,
      minimumStock: 10,
      description: 'Obat batuk berdahak untuk dewasa',
    },
    {
      code: 'OBB-004',
      name: 'Ibuprofen 400mg',
      category: 'Obat Bebas Terbatas',
      unit: 'Strip',
      supplier: 'PT Dexa Medica',
      purchasePrice: 5500,
      sellingPrice: 8000,
      stock: 100,
      minimumStock: 20,
      description: 'Anti inflamasi non-steroid untuk nyeri dan demam',
    },
    {
      code: 'OBK-001',
      name: 'Amoxicillin 500mg',
      category: 'Obat Keras',
      unit: 'Strip',
      supplier: 'PT Sanbe Farma',
      purchasePrice: 12000,
      sellingPrice: 18000,
      stock: 200,
      minimumStock: 30,
      description: 'Antibiotik golongan penisilin untuk infeksi bakteri',
    },
    {
      code: 'OBK-002',
      name: 'Ciprofloxacin 500mg',
      category: 'Obat Keras',
      unit: 'Strip',
      supplier: 'PT Dexa Medica',
      purchasePrice: 15000,
      sellingPrice: 22000,
      stock: 120,
      minimumStock: 20,
      description: 'Antibiotik golongan fluorokuinolon',
    },
    {
      code: 'OBK-003',
      name: 'Metformin 500mg',
      category: 'Obat Keras',
      unit: 'Strip',
      supplier: 'PT Kimia Farma',
      purchasePrice: 8000,
      sellingPrice: 12000,
      stock: 90,
      minimumStock: 15,
      description: 'Antidiabetik oral untuk diabetes mellitus tipe 2',
    },
    {
      code: 'SUP-001',
      name: 'Vitamin C 500mg',
      category: 'Suplemen & Vitamin',
      unit: 'Strip',
      supplier: 'PT Kalbe Farma',
      purchasePrice: 6000,
      sellingPrice: 9000,
      stock: 250,
      minimumStock: 30,
      description: 'Suplemen vitamin C untuk daya tahan tubuh',
    },
    {
      code: 'SUP-002',
      name: 'Vitamin D3 1000IU',
      category: 'Suplemen & Vitamin',
      unit: 'Box',
      supplier: 'PT Fahrenheit',
      purchasePrice: 45000,
      sellingPrice: 65000,
      stock: 40,
      minimumStock: 10,
      description: 'Suplemen vitamin D untuk kesehatan tulang dan imunitas',
    },
    {
      code: 'SUP-003',
      name: 'Blackmores Omega-3',
      category: 'Suplemen & Vitamin',
      unit: 'Box',
      supplier: 'PT Fahrenheit',
      purchasePrice: 85000,
      sellingPrice: 120000,
      stock: 25,
      minimumStock: 5,
      description: 'Suplemen minyak ikan omega-3 untuk kesehatan jantung',
    },
    {
      code: 'ALK-001',
      name: 'Betadine Antiseptik 30ml',
      category: 'Obat Bebas',
      unit: 'Botol',
      supplier: 'PT Kimia Farma',
      purchasePrice: 12000,
      sellingPrice: 17000,
      stock: 70,
      minimumStock: 10,
      description: 'Antiseptik povidone iodine untuk luka dan disinfeksi',
    },
    {
      code: 'ALK-002',
      name: 'Tensimeter Digital Omron',
      category: 'Alat Kesehatan',
      unit: 'Pcs',
      supplier: 'PT Fahrenheit',
      purchasePrice: 280000,
      sellingPrice: 380000,
      stock: 10,
      minimumStock: 2,
      description: 'Alat ukur tekanan darah digital untuk penggunaan rumahan',
    },
    {
      code: 'ALK-003',
      name: 'Masker Medis 3 Ply (50pcs)',
      category: 'Alat Kesehatan',
      unit: 'Box',
      supplier: 'PT Kimia Farma',
      purchasePrice: 35000,
      sellingPrice: 50000,
      stock: 50,
      minimumStock: 10,
      description: 'Masker medis 3 lapis untuk perlindungan saluran pernapasan',
    },
    {
      code: 'HRB-001',
      name: 'Tolak Angin Cair',
      category: 'Herbal & Tradisional',
      unit: 'Box',
      supplier: 'PT Kalbe Farma',
      purchasePrice: 18000,
      sellingPrice: 25000,
      stock: 45,
      minimumStock: 10,
      description: 'Jamu tradisional untuk meredakan masuk angin',
    },
    {
      code: 'HRB-002',
      name: 'Antangin JRG Kapsul',
      category: 'Herbal & Tradisional',
      unit: 'Strip',
      supplier: 'PT Kalbe Farma',
      purchasePrice: 10000,
      sellingPrice: 14000,
      stock: 60,
      minimumStock: 10,
      description: 'Kapsul herbal untuk masuk angin dan kembung',
    },
  ]

  for (const p of productData) {
    const existing = await prisma.product.findUnique({ where: { code: p.code } })
    if (existing) continue

    await prisma.product.create({
      data: {
        code: p.code,
        name: p.name,
        categoryId: catMap[p.category].id,
        unitId: unitMap[p.unit].id,
        supplierId: supMap[p.supplier]?.id,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        minimumStock: p.minimumStock,
        description: p.description,
      },
    })
  }

  // ── Settings ───────────────────────────────────────────────────────────────
  const existingSetting = await prisma.setting.findFirst()
  if (!existingSetting) {
    await prisma.setting.create({
      data: {
        storeName: 'Apotik PharmaPOS',
        taxPercentage: 11,
        autoPrint: false,
      },
    })
  }

  console.log('Seed selesai')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
