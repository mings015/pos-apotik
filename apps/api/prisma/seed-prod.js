// Full production seed — converted from seed.ts, no dotenv, no ts-node
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

function daysFromNow(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d
}

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
  const usersData = [
    { name: 'Super Admin',  email: 'admin@pharmapos.com',  password: 'admin123',  role: 'SUPER_ADMIN' },
    { name: 'Ahmad Fauzi',  email: 'admin2@pharmapos.com', password: 'admin123',  role: 'ADMIN' },
    { name: 'Siti Rahayu',  email: 'kasir@pharmapos.com',  password: 'kasir123',  role: 'CASHIER' },
    { name: 'Budi Santoso', email: 'gudang@pharmapos.com', password: 'gudang123', role: 'WAREHOUSE' },
  ]

  const createdUsers = {}
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: await bcrypt.hash(u.password, 10),
        roleId: roleMap[u.role].id,
      },
    })
    createdUsers[u.role] = user
  }
  const superAdminId = createdUsers['SUPER_ADMIN'].id
  const warehouseId  = createdUsers['WAREHOUSE'].id

  // ── Categories ─────────────────────────────────────────────────────────────
  const categoryData = [
    { name: 'Obat Bebas',           description: 'Obat yang dapat dibeli tanpa resep dokter' },
    { name: 'Obat Keras',           description: 'Obat yang hanya dapat dibeli dengan resep dokter' },
    { name: 'Obat Bebas Terbatas',  description: 'Obat bebas dengan batasan tertentu' },
    { name: 'Suplemen & Vitamin',   description: 'Suplemen kesehatan dan multivitamin' },
    { name: 'Alat Kesehatan',       description: 'Peralatan dan perlengkapan kesehatan' },
    { name: 'Herbal & Tradisional', description: 'Obat herbal dan jamu tradisional' },
    { name: 'Produk Bayi',          description: 'Produk perawatan dan kesehatan bayi' },
    { name: 'Kosmetik Medis',       description: 'Produk perawatan kulit dan kecantikan medis' },
  ]
  const categories = await Promise.all(
    categoryData.map((c) => prisma.category.upsert({ where: { name: c.name }, update: {}, create: c })),
  )
  const catMap = Object.fromEntries(categories.map((c) => [c.name, c]))

  // ── Units ──────────────────────────────────────────────────────────────────
  const unitData = [
    { name: 'Tablet', symbol: 'tab' },  { name: 'Kapsul', symbol: 'kap' },
    { name: 'Strip',  symbol: 'strip' }, { name: 'Box',    symbol: 'box' },
    { name: 'Botol',  symbol: 'btl' },  { name: 'Tube',   symbol: 'tube' },
    { name: 'Sachet', symbol: 'sach' }, { name: 'Ampul',  symbol: 'amp' },
    { name: 'Vial',   symbol: 'vial' }, { name: 'Pcs',    symbol: 'pcs' },
  ]
  const units = await Promise.all(
    unitData.map((u) => prisma.unit.upsert({ where: { name: u.name }, update: {}, create: u })),
  )
  const unitMap = Object.fromEntries(units.map((u) => [u.name, u]))

  // ── Suppliers ──────────────────────────────────────────────────────────────
  const supplierData = [
    { name: 'PT Kimia Farma', phone: '021-5551234', email: 'order@kimiafarma.co.id',  address: 'Jl. Veteran No.9, Jakarta Pusat' },
    { name: 'PT Kalbe Farma', phone: '021-4287088', email: 'order@kalbe.co.id',        address: 'Jl. Let. Jend. Suprapto Kav.4, Jakarta Pusat' },
    { name: 'PT Dexa Medica', phone: '0711-537500', email: 'info@dexa-medica.com',     address: 'Jl. Jend. Bambang Utoyo, Palembang' },
    { name: 'PT Sanbe Farma', phone: '022-6040868', email: 'info@sanbe.com',           address: 'Jl. Industri No.1, Leuwigajah, Bandung' },
    { name: 'PT Fahrenheit',  phone: '021-5551122', email: 'sales@fahrenheit.co.id',   address: 'Jl. Panjang No.5, Jakarta Barat' },
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
    { code: 'OBB-001', name: 'Paracetamol 500mg',          category: 'Obat Bebas',          unit: 'Strip',  supplier: 'PT Kimia Farma', purchasePrice: 3500,   sellingPrice: 5000,   stock: 150, minimumStock: 20, description: 'Analgesik dan antipiretik untuk meredakan demam dan nyeri ringan' },
    { code: 'OBB-002', name: 'Antasida Doen',               category: 'Obat Bebas',          unit: 'Strip',  supplier: 'PT Kimia Farma', purchasePrice: 4000,   sellingPrice: 6000,   stock: 80,  minimumStock: 15, description: 'Antasida untuk meredakan maag dan gangguan pencernaan' },
    { code: 'OBB-003', name: 'OBH Combi Batuk Berdahak',   category: 'Obat Bebas',          unit: 'Botol',  supplier: 'PT Kalbe Farma', purchasePrice: 18000,  sellingPrice: 25000,  stock: 60,  minimumStock: 10, description: 'Obat batuk berdahak untuk dewasa' },
    { code: 'OBB-004', name: 'Ibuprofen 400mg',             category: 'Obat Bebas Terbatas', unit: 'Strip',  supplier: 'PT Dexa Medica', purchasePrice: 5500,   sellingPrice: 8000,   stock: 100, minimumStock: 20, description: 'Anti inflamasi non-steroid untuk nyeri dan demam' },
    { code: 'OBK-001', name: 'Amoxicillin 500mg',           category: 'Obat Keras',          unit: 'Strip',  supplier: 'PT Sanbe Farma', purchasePrice: 12000,  sellingPrice: 18000,  stock: 200, minimumStock: 30, description: 'Antibiotik golongan penisilin untuk infeksi bakteri' },
    { code: 'OBK-002', name: 'Ciprofloxacin 500mg',         category: 'Obat Keras',          unit: 'Strip',  supplier: 'PT Dexa Medica', purchasePrice: 15000,  sellingPrice: 22000,  stock: 120, minimumStock: 20, description: 'Antibiotik golongan fluorokuinolon' },
    { code: 'OBK-003', name: 'Metformin 500mg',             category: 'Obat Keras',          unit: 'Strip',  supplier: 'PT Kimia Farma', purchasePrice: 8000,   sellingPrice: 12000,  stock: 90,  minimumStock: 15, description: 'Antidiabetik oral untuk diabetes mellitus tipe 2' },
    { code: 'SUP-001', name: 'Vitamin C 500mg',             category: 'Suplemen & Vitamin',  unit: 'Strip',  supplier: 'PT Kalbe Farma', purchasePrice: 6000,   sellingPrice: 9000,   stock: 250, minimumStock: 30, description: 'Suplemen vitamin C untuk daya tahan tubuh' },
    { code: 'SUP-002', name: 'Vitamin D3 1000IU',           category: 'Suplemen & Vitamin',  unit: 'Box',    supplier: 'PT Fahrenheit',  purchasePrice: 45000,  sellingPrice: 65000,  stock: 40,  minimumStock: 10, description: 'Suplemen vitamin D untuk kesehatan tulang dan imunitas' },
    { code: 'SUP-003', name: 'Blackmores Omega-3',          category: 'Suplemen & Vitamin',  unit: 'Box',    supplier: 'PT Fahrenheit',  purchasePrice: 85000,  sellingPrice: 120000, stock: 25,  minimumStock: 5,  description: 'Suplemen minyak ikan omega-3 untuk kesehatan jantung' },
    { code: 'ALK-001', name: 'Betadine Antiseptik 30ml',   category: 'Obat Bebas',          unit: 'Botol',  supplier: 'PT Kimia Farma', purchasePrice: 12000,  sellingPrice: 17000,  stock: 70,  minimumStock: 10, description: 'Antiseptik povidone iodine untuk luka dan disinfeksi' },
    { code: 'ALK-002', name: 'Tensimeter Digital Omron',   category: 'Alat Kesehatan',      unit: 'Pcs',    supplier: 'PT Fahrenheit',  purchasePrice: 280000, sellingPrice: 380000, stock: 10,  minimumStock: 2,  description: 'Alat ukur tekanan darah digital untuk penggunaan rumahan' },
    { code: 'ALK-003', name: 'Masker Medis 3 Ply (50pcs)', category: 'Alat Kesehatan',      unit: 'Box',    supplier: 'PT Kimia Farma', purchasePrice: 35000,  sellingPrice: 50000,  stock: 50,  minimumStock: 10, description: 'Masker medis 3 lapis untuk perlindungan saluran pernapasan' },
    { code: 'HRB-001', name: 'Tolak Angin Cair',           category: 'Herbal & Tradisional', unit: 'Box',   supplier: 'PT Kalbe Farma', purchasePrice: 18000,  sellingPrice: 25000,  stock: 45,  minimumStock: 10, description: 'Jamu tradisional untuk meredakan masuk angin' },
    { code: 'HRB-002', name: 'Antangin JRG Kapsul',        category: 'Herbal & Tradisional', unit: 'Strip', supplier: 'PT Kalbe Farma', purchasePrice: 10000,  sellingPrice: 14000,  stock: 60,  minimumStock: 10, description: 'Kapsul herbal untuk masuk angin dan kembung' },
  ]

  const productMap = {}
  for (const p of productData) {
    const existing = await prisma.product.findUnique({ where: { code: p.code } })
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          code: p.code, name: p.name,
          categoryId: catMap[p.category].id,
          unitId: unitMap[p.unit].id,
          supplierId: supMap[p.supplier]?.id,
          purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice,
          stock: p.stock, minimumStock: p.minimumStock, description: p.description,
        },
      })
      productMap[p.code] = { id: created.id, stock: p.stock }
    } else {
      productMap[p.code] = { id: existing.id, stock: existing.stock }
    }
  }
  console.log('Seed: roles, users, categories, units, suppliers, products selesai')

  // ── Batches & Stock Movements ──────────────────────────────────────────────
  const existingBatchCount = await prisma.productBatch.count()
  if (existingBatchCount === 0) {
    const batchConfig = [
      { code: 'OBB-001', batchNumber: 'B-PAR-2025A', expired: daysFromNow(-5),   qty: 20,  actor: warehouseId,  note: 'Penerimaan batch lama' },
      { code: 'OBB-001', batchNumber: 'B-PAR-2026B', expired: daysFromNow(300),  qty: 130, actor: warehouseId,  note: 'Penerimaan stok reguler' },
      { code: 'OBB-002', batchNumber: 'B-ANT-2026A', expired: daysFromNow(280),  qty: 80,  actor: warehouseId,  note: 'Penerimaan stok reguler' },
      { code: 'OBB-003', batchNumber: 'B-OBH-2026A', expired: daysFromNow(400),  qty: 60,  actor: warehouseId,  note: 'Penerimaan stok reguler' },
      { code: 'OBB-004', batchNumber: 'B-IBU-2026A', expired: daysFromNow(450),  qty: 100, actor: warehouseId,  note: 'Penerimaan stok reguler' },
      { code: 'OBK-001', batchNumber: 'B-AMX-2025A', expired: daysFromNow(-45),  qty: 20,  actor: warehouseId,  note: 'Batch lama — expired' },
      { code: 'OBK-001', batchNumber: 'B-AMX-2026B', expired: daysFromNow(450),  qty: 180, actor: warehouseId,  note: 'Penerimaan stok baru' },
      { code: 'OBK-002', batchNumber: 'B-CIP-2025A', expired: daysFromNow(14),   qty: 20,  actor: warehouseId,  note: 'Batch mendekati expired' },
      { code: 'OBK-002', batchNumber: 'B-CIP-2026B', expired: daysFromNow(500),  qty: 100, actor: warehouseId,  note: 'Penerimaan stok baru' },
      { code: 'OBK-003', batchNumber: 'B-MET-2026A', expired: daysFromNow(540),  qty: 90,  actor: warehouseId,  note: 'Penerimaan stok reguler' },
      { code: 'SUP-001', batchNumber: 'B-VTC-2026A', expired: daysFromNow(600),  qty: 250, actor: superAdminId, note: 'Penerimaan stok reguler' },
      { code: 'SUP-002', batchNumber: 'B-VTD-2025A', expired: daysFromNow(-90),  qty: 5,   actor: warehouseId,  note: 'Batch lama — expired' },
      { code: 'SUP-002', batchNumber: 'B-VTD-2026B', expired: daysFromNow(400),  qty: 35,  actor: warehouseId,  note: 'Penerimaan stok baru' },
      { code: 'SUP-003', batchNumber: 'B-OMG-2026A', expired: daysFromNow(450),  qty: 25,  actor: superAdminId, note: 'Penerimaan stok reguler' },
      { code: 'ALK-001', batchNumber: 'B-BTD-2025A', expired: daysFromNow(25),   qty: 30,  actor: warehouseId,  note: 'Batch mendekati expired' },
      { code: 'ALK-001', batchNumber: 'B-BTD-2026B', expired: daysFromNow(350),  qty: 40,  actor: warehouseId,  note: 'Penerimaan stok baru' },
      { code: 'ALK-002', batchNumber: 'B-TNS-2026A', expired: daysFromNow(1200), qty: 10,  actor: superAdminId, note: 'Penerimaan alat kesehatan' },
      { code: 'ALK-003', batchNumber: 'B-MSK-2026A', expired: daysFromNow(280),  qty: 50,  actor: warehouseId,  note: 'Penerimaan stok reguler' },
      { code: 'HRB-001', batchNumber: 'B-TLK-2025A', expired: daysFromNow(20),   qty: 15,  actor: warehouseId,  note: 'Batch mendekati expired' },
      { code: 'HRB-001', batchNumber: 'B-TLK-2026B', expired: daysFromNow(500),  qty: 30,  actor: warehouseId,  note: 'Penerimaan stok baru' },
      { code: 'HRB-002', batchNumber: 'B-ATG-2026A', expired: daysFromNow(420),  qty: 60,  actor: warehouseId,  note: 'Penerimaan stok reguler' },
    ]

    const runningStock = {}
    for (const b of batchConfig) {
      const product = productMap[b.code]
      if (!product) continue
      const before = runningStock[b.code] ?? 0
      const after  = before + b.qty
      runningStock[b.code] = after

      const batch = await prisma.productBatch.create({
        data: { productId: product.id, batchNumber: b.batchNumber, expiredDate: b.expired, quantity: b.qty },
      })
      await prisma.stockMovement.create({
        data: {
          productId: product.id, batchId: batch.id, movementType: 'IN',
          quantity: b.qty, beforeStock: before, afterStock: after,
          notes: b.note, createdById: b.actor,
        },
      })
    }

    const par  = productMap['OBB-001']
    const vitC = productMap['SUP-001']
    if (par) {
      await prisma.stockMovement.create({
        data: { productId: par.id, movementType: 'ADJUSTMENT', quantity: -5, beforeStock: 150, afterStock: 145, notes: 'Koreksi: 5 strip rusak saat pengiriman', createdById: superAdminId },
      })
      await prisma.product.update({ where: { id: par.id }, data: { stock: 145 } })
    }
    if (vitC) {
      await prisma.stockMovement.create({
        data: { productId: vitC.id, movementType: 'OPNAME', quantity: -3, beforeStock: 250, afterStock: 247, notes: 'Opname: hitungan fisik 247 vs sistem 250', createdById: superAdminId },
      })
      await prisma.product.update({ where: { id: vitC.id }, data: { stock: 247 } })
    }
    console.log(`Seed: ${batchConfig.length} batch + movements dibuat`)
  } else {
    console.log(`Seed: skip batch (sudah ada ${existingBatchCount} batch)`)
  }

  // ── Settings ───────────────────────────────────────────────────────────────
  const existingSetting = await prisma.setting.findFirst()
  if (!existingSetting) {
    await prisma.setting.create({ data: { storeName: 'Apotik PharmaPOS', taxPercentage: 11, autoPrint: false } })
    console.log('Seed: settings dibuat')
  }

  // ── Purchase Orders ────────────────────────────────────────────────────────
  const existingPoCount = await prisma.purchaseOrder.count()
  if (existingPoCount === 0) {
    function makePoNumber(date, seq) {
      const d = date.toISOString().slice(0, 10).replace(/-/g, '')
      return `PO-${d}-${String(seq).padStart(4, '0')}`
    }
    function makeInvoiceNumber(date, seq) {
      const d = date.toISOString().slice(0, 10).replace(/-/g, '')
      return `SINV-${d}-${String(seq).padStart(4, '0')}`
    }
    function makeReturnNumber(date) {
      const d = date.toISOString().slice(0, 10).replace(/-/g, '')
      return `RTN-${d}-0001`
    }

    const date30 = daysFromNow(-30), date28 = daysFromNow(-28)
    const date15 = daysFromNow(-15), date10 = daysFromNow(-10)
    const date5  = daysFromNow(-5),  date2  = daysFromNow(-2)
    const date7  = daysFromNow(-7)

    // PO 1: RECEIVED — PT Kimia Farma
    const po1Subtotal = 100 * 3500 + 50 * 4000
    const po1 = await prisma.purchaseOrder.create({
      data: {
        poNumber: makePoNumber(date30, 1), supplierId: supMap['PT Kimia Farma'].id,
        subtotal: po1Subtotal, tax: 0, discount: 0, total: po1Subtotal,
        status: 'RECEIVED', notes: 'Pemesanan rutin bulanan stok Paracetamol dan Antasida',
        createdById: superAdminId, createdAt: date30, updatedAt: date28,
        items: { create: [
          { productId: productMap['OBB-001'].id, quantity: 100, purchasePrice: 3500, subtotal: 350000 },
          { productId: productMap['OBB-002'].id, quantity: 50,  purchasePrice: 4000, subtotal: 200000 },
        ]},
      },
    })

    const gr1 = await prisma.goodsReceiving.create({
      data: { purchaseOrderId: po1.id, receivedById: warehouseId, notes: 'Barang diterima lengkap sesuai PO', createdAt: date28 },
    })

    const grItems1 = [
      { code: 'OBB-001', qty: 100, batchNo: 'B-PAR-PO1-01', expired: daysFromNow(365), price: 3500 },
      { code: 'OBB-002', qty: 50,  batchNo: 'B-ANT-PO1-01', expired: daysFromNow(400), price: 4000 },
    ]
    const grBatchMap = {}

    for (const gi of grItems1) {
      const prod = productMap[gi.code]
      const prodData = await prisma.product.findUnique({ where: { id: prod.id } })
      const beforeStock = prodData.stock

      const batch = await prisma.productBatch.create({
        data: { productId: prod.id, batchNumber: gi.batchNo, expiredDate: gi.expired, quantity: gi.qty, createdAt: date28 },
      })
      grBatchMap[gi.code] = batch.id

      await prisma.product.update({ where: { id: prod.id }, data: { stock: { increment: gi.qty } } })
      await prisma.stockMovement.create({
        data: {
          productId: prod.id, batchId: batch.id, movementType: 'IN',
          quantity: gi.qty, beforeStock, afterStock: beforeStock + gi.qty,
          referenceType: 'GOODS_RECEIVING', referenceId: gr1.id,
          notes: `Penerimaan barang PO ${po1.poNumber}`, createdById: warehouseId, createdAt: date28,
        },
      })
      await prisma.goodsReceivingItem.create({
        data: { goodsReceivingId: gr1.id, productId: prod.id, batchId: batch.id, quantity: gi.qty, purchasePrice: gi.price },
      })
    }

    const inv1 = await prisma.supplierInvoice.create({
      data: {
        purchaseOrderId: po1.id, invoiceNumber: makeInvoiceNumber(date28, 1),
        totalAmount: po1Subtotal, paidAmount: 300000, paymentStatus: 'PARTIAL',
        dueDate: daysFromNow(15), createdAt: date28, updatedAt: date7,
      },
    })
    await prisma.supplierPayment.create({
      data: { supplierInvoiceId: inv1.id, amount: 300000, paymentMethod: 'TRANSFER', paymentDate: date7, notes: 'Pembayaran DP 50%+', createdById: superAdminId, createdAt: date7 },
    })

    // Purchase Return
    const rtnDate = daysFromNow(-20)
    const parBatchId = grBatchMap['OBB-001']
    const parProd = await prisma.product.findUnique({ where: { id: productMap['OBB-001'].id } })
    const parBefore = parProd.stock

    const rtn1 = await prisma.purchaseReturn.create({
      data: {
        returnNumber: makeReturnNumber(rtnDate), supplierInvoiceId: inv1.id,
        reason: 'Kualitas buruk — 5 strip ditemukan rusak saat pengecekan',
        notes: 'Dikonfirmasi oleh gudang', createdById: warehouseId, createdAt: rtnDate,
        items: { create: [{ productId: productMap['OBB-001'].id, batchId: parBatchId, quantity: 5 }] },
      },
    })
    await prisma.productBatch.update({ where: { id: parBatchId }, data: { quantity: { decrement: 5 } } })
    await prisma.product.update({ where: { id: productMap['OBB-001'].id }, data: { stock: { decrement: 5 } } })
    await prisma.stockMovement.create({
      data: {
        productId: productMap['OBB-001'].id, batchId: parBatchId, movementType: 'RETURN',
        quantity: 5, beforeStock: parBefore, afterStock: parBefore - 5,
        referenceType: 'PURCHASE_RETURN', referenceId: rtn1.id,
        notes: `Retur pembelian ${rtn1.returnNumber}`, createdById: warehouseId, createdAt: rtnDate,
      },
    })

    // PO 2: APPROVED — PT Kalbe Farma
    const po2Subtotal = 30 * 18000 + 100 * 6000
    await prisma.purchaseOrder.create({
      data: {
        poNumber: makePoNumber(date10, 1), supplierId: supMap['PT Kalbe Farma'].id,
        subtotal: po2Subtotal, tax: 0, discount: 50000, total: po2Subtotal - 50000,
        status: 'APPROVED', notes: 'Diskon khusus awal bulan dari Kalbe Farma',
        createdById: superAdminId, createdAt: date10, updatedAt: date10,
        items: { create: [
          { productId: productMap['OBB-003'].id, quantity: 30,  purchasePrice: 18000, subtotal: 540000 },
          { productId: productMap['SUP-001'].id, quantity: 100, purchasePrice: 6000,  subtotal: 600000 },
        ]},
      },
    })

    // PO 3: RECEIVED — PT Dexa Medica (LUNAS)
    const po3Subtotal = 80 * 5500 + 60 * 15000
    const po3Date = daysFromNow(-20), po3Rcv = daysFromNow(-18)
    const po3 = await prisma.purchaseOrder.create({
      data: {
        poNumber: makePoNumber(po3Date, 1), supplierId: supMap['PT Dexa Medica'].id,
        subtotal: po3Subtotal, tax: 0, discount: 0, total: po3Subtotal,
        status: 'RECEIVED', createdById: superAdminId, createdAt: po3Date, updatedAt: po3Rcv,
        items: { create: [
          { productId: productMap['OBB-004'].id, quantity: 80, purchasePrice: 5500,  subtotal: 440000 },
          { productId: productMap['OBK-002'].id, quantity: 60, purchasePrice: 15000, subtotal: 900000 },
        ]},
      },
    })

    const gr3 = await prisma.goodsReceiving.create({
      data: { purchaseOrderId: po3.id, receivedById: warehouseId, createdAt: po3Rcv },
    })

    for (const gi of [
      { code: 'OBB-004', qty: 80, batchNo: 'B-IBU-PO3-01', expired: daysFromNow(500), price: 5500 },
      { code: 'OBK-002', qty: 60, batchNo: 'B-CIP-PO3-01', expired: daysFromNow(550), price: 15000 },
    ]) {
      const prod = productMap[gi.code]
      const prodData = await prisma.product.findUnique({ where: { id: prod.id } })
      const before = prodData.stock

      const batch = await prisma.productBatch.create({
        data: { productId: prod.id, batchNumber: gi.batchNo, expiredDate: gi.expired, quantity: gi.qty, createdAt: po3Rcv },
      })
      await prisma.product.update({ where: { id: prod.id }, data: { stock: { increment: gi.qty } } })
      await prisma.stockMovement.create({
        data: {
          productId: prod.id, batchId: batch.id, movementType: 'IN',
          quantity: gi.qty, beforeStock: before, afterStock: before + gi.qty,
          referenceType: 'GOODS_RECEIVING', referenceId: gr3.id,
          notes: `Penerimaan barang PO ${po3.poNumber}`, createdById: warehouseId, createdAt: po3Rcv,
        },
      })
      await prisma.goodsReceivingItem.create({
        data: { goodsReceivingId: gr3.id, productId: prod.id, batchId: batch.id, quantity: gi.qty, purchasePrice: gi.price },
      })
    }

    const inv3 = await prisma.supplierInvoice.create({
      data: {
        purchaseOrderId: po3.id, invoiceNumber: makeInvoiceNumber(po3Rcv, 2),
        totalAmount: po3Subtotal, paidAmount: po3Subtotal, paymentStatus: 'PAID',
        createdAt: po3Rcv, updatedAt: daysFromNow(-10),
      },
    })
    await prisma.supplierPayment.create({
      data: { supplierInvoiceId: inv3.id, amount: po3Subtotal, paymentMethod: 'TRANSFER', paymentDate: daysFromNow(-10), notes: 'Pelunasan penuh', createdById: superAdminId, createdAt: daysFromNow(-10) },
    })

    // PO 4: PENDING
    await prisma.purchaseOrder.create({
      data: {
        poNumber: makePoNumber(date5, 1), supplierId: supMap['PT Sanbe Farma'].id,
        subtotal: 100 * 12000, tax: 0, discount: 0, total: 100 * 12000,
        status: 'PENDING', notes: 'Menunggu persetujuan kepala apotik',
        createdById: superAdminId, createdAt: date5, updatedAt: date5,
        items: { create: [{ productId: productMap['OBK-001'].id, quantity: 100, purchasePrice: 12000, subtotal: 1200000 }] },
      },
    })

    // PO 5: DRAFT
    await prisma.purchaseOrder.create({
      data: {
        poNumber: makePoNumber(date2, 1), supplierId: supMap['PT Fahrenheit'].id,
        subtotal: 20 * 45000 + 10 * 85000, tax: 0, discount: 0, total: 20 * 45000 + 10 * 85000,
        status: 'DRAFT', notes: 'Draft pemesanan suplemen untuk bulan depan',
        createdById: superAdminId, createdAt: date2, updatedAt: date2,
        items: { create: [
          { productId: productMap['SUP-002'].id, quantity: 20, purchasePrice: 45000, subtotal: 900000 },
          { productId: productMap['SUP-003'].id, quantity: 10, purchasePrice: 85000, subtotal: 850000 },
        ]},
      },
    })

    // PO 6: CANCELLED
    await prisma.purchaseOrder.create({
      data: {
        poNumber: makePoNumber(date15, 2), supplierId: supMap['PT Kimia Farma'].id,
        subtotal: 50 * 8000, tax: 0, discount: 0, total: 50 * 8000,
        status: 'CANCELLED', notes: 'Dibatalkan — stok masih mencukupi',
        createdById: superAdminId, createdAt: date15, updatedAt: date15,
        items: { create: [{ productId: productMap['OBK-003'].id, quantity: 50, purchasePrice: 8000, subtotal: 400000 }] },
      },
    })

    console.log('Seed: 6 purchase order + 2 goods receiving + 2 supplier invoice + 2 payment + 1 purchase return dibuat')
  } else {
    console.log(`Seed: skip purchase orders (sudah ada ${existingPoCount} PO)`)
  }

  console.log('Seed selesai ✓')
}

main().catch(console.error).finally(() => prisma.$disconnect())
