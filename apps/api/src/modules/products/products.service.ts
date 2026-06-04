import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { QueryProductDto } from './dto/query-product.dto'
import { ImportProductsDto } from './dto/import-product.dto'

const productSelect = {
  id: true,
  code: true,
  barcode: true,
  name: true,
  categoryId: true,
  supplierId: true,
  unitId: true,
  purchasePrice: true,
  sellingPrice: true,
  stock: true,
  minimumStock: true,
  productImage: true,
  description: true,
  isActive: true,
  category: true,
  supplier: true,
  unit: true,
  createdAt: true,
  updatedAt: true,
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const { page = 1, limit = 10, search, categoryId, supplierId, isActive } = query
    const skip = (page - 1) * limit

    const where = {
      ...(categoryId && { categoryId }),
      ...(supplierId && { supplierId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
          { barcode: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        select: productSelect,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, select: productSelect })
    if (!product) throw new NotFoundException('Produk tidak ditemukan')
    return product
  }

  async create(dto: CreateProductDto, imageFilename?: string) {
    const codeExists = await this.prisma.product.findUnique({ where: { code: dto.code } })
    if (codeExists) throw new ConflictException('Kode produk sudah digunakan')

    if (dto.barcode) {
      const barcodeExists = await this.prisma.product.findUnique({ where: { barcode: dto.barcode } })
      if (barcodeExists) throw new ConflictException('Barcode sudah digunakan')
    }

    return this.prisma.product.create({
      data: { ...dto, productImage: imageFilename ?? null },
      select: productSelect,
    })
  }

  async update(id: string, dto: UpdateProductDto, imageFilename?: string) {
    await this.findOne(id)

    if (dto.code) {
      const exists = await this.prisma.product.findFirst({ where: { code: dto.code, NOT: { id } } })
      if (exists) throw new ConflictException('Kode produk sudah digunakan')
    }

    return this.prisma.product.update({
      where: { id },
      data: { ...dto, ...(imageFilename && { productImage: imageFilename }) },
      select: productSelect,
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.product.delete({ where: { id } })
  }

  async importProducts(dto: ImportProductsDto) {
    const [categories, units, suppliers] = await Promise.all([
      this.prisma.category.findMany({ select: { id: true, name: true } }),
      this.prisma.unit.findMany({ select: { id: true, name: true } }),
      this.prisma.supplier.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    ])

    const categoryMap = new Map(categories.map((c) => [c.name.toLowerCase().trim(), c.id]))
    const unitMap = new Map(units.map((u) => [u.name.toLowerCase().trim(), u.id]))
    const supplierMap = new Map(suppliers.map((s) => [s.name.toLowerCase().trim(), s.id]))

    const errors: { row: number; message: string }[] = []
    const toCreate: {
      code: string; name: string; categoryId: string; unitId: string
      supplierId: string | null; purchasePrice: number; sellingPrice: number
      stock: number; minimumStock: number; barcode: string | null; description: string | null
    }[] = []

    for (let i = 0; i < dto.rows.length; i++) {
      const row = dto.rows[i]
      const rowNum = i + 2

      const categoryId = categoryMap.get(row.categoryName?.toLowerCase().trim() ?? '')
      if (!categoryId) {
        errors.push({ row: rowNum, message: `Kategori "${row.categoryName}" tidak ditemukan` })
        continue
      }

      const unitId = unitMap.get(row.unitName?.toLowerCase().trim() ?? '')
      if (!unitId) {
        errors.push({ row: rowNum, message: `Satuan "${row.unitName}" tidak ditemukan` })
        continue
      }

      let supplierId: string | null = null
      if (row.supplierName?.trim()) {
        supplierId = supplierMap.get(row.supplierName.toLowerCase().trim()) ?? null
        if (!supplierId) {
          errors.push({ row: rowNum, message: `Supplier "${row.supplierName}" tidak ditemukan` })
          continue
        }
      }

      toCreate.push({
        code: row.code.trim(),
        name: row.name.trim(),
        categoryId,
        unitId,
        supplierId,
        purchasePrice: Number(row.purchasePrice) || 0,
        sellingPrice: Number(row.sellingPrice) || 0,
        stock: Number(row.stock) || 0,
        minimumStock: Number(row.minimumStock) || 0,
        barcode: row.barcode?.trim() || null,
        description: row.description?.trim() || null,
      })
    }

    if (toCreate.length === 0) {
      return { created: 0, skipped: 0, errors, total: dto.rows.length }
    }

    const existingCodes = await this.prisma.product.findMany({
      where: { code: { in: toCreate.map((r) => r.code) } },
      select: { code: true },
    })
    const existingCodeSet = new Set(existingCodes.map((p) => p.code))

    const skipped: { row: number; message: string }[] = []
    const final = toCreate.filter((r, i) => {
      if (existingCodeSet.has(r.code)) {
        skipped.push({ row: i + 2, message: `Kode "${r.code}" sudah ada, dilewati` })
        return false
      }
      return true
    })

    const result = await this.prisma.product.createMany({ data: final, skipDuplicates: true })

    return {
      created: result.count,
      skipped: skipped.length,
      errors: [...errors, ...skipped],
      total: dto.rows.length,
    }
  }
}
