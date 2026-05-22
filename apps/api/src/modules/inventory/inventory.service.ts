import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { StockInDto } from './dto/stock-in.dto'
import { StockOutDto } from './dto/stock-out.dto'
import { AdjustmentDto } from './dto/adjustment.dto'
import { OpnameDto } from './dto/opname.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const today = new Date()
    const thirtyDaysLater = new Date(today)
    thirtyDaysLater.setDate(today.getDate() + 30)

    const [totalProducts, expiredBatches, nearExpiredBatches] = await this.prisma.$transaction([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.productBatch.count({
        where: { expiredDate: { lt: today }, quantity: { gt: 0 } },
      }),
      this.prisma.productBatch.count({
        where: {
          expiredDate: { gte: today, lte: thirtyDaysLater },
          quantity: { gt: 0 },
        },
      }),
    ])

    const lowStockResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::int AS count FROM products
      WHERE is_active = true AND stock <= minimum_stock
    `
    const lowStockCount = Number(lowStockResult[0]?.count ?? 0)

    return { totalProducts, lowStockCount, expiredCount: expiredBatches, nearExpiredCount: nearExpiredBatches }
  }

  async getStockList(query: PaginationDto) {
    const { page = 1, limit = 10, search, isActive } = query
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (isActive !== undefined) where.isActive = isActive

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          stock: true,
          minimumStock: true,
          isActive: true,
          unit: { select: { name: true, symbol: true } },
          category: { select: { name: true } },
          batches: {
            where: { quantity: { gt: 0 } },
            select: { id: true, batchNumber: true, expiredDate: true, quantity: true },
            orderBy: { expiredDate: 'asc' },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async stockIn(dto: StockInDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: dto.productId } })
      if (!product) throw new NotFoundException('Produk tidak ditemukan')
      if (!product.isActive) throw new BadRequestException('Produk tidak aktif')

      const batch = await tx.productBatch.create({
        data: {
          productId: dto.productId,
          batchNumber: dto.batchNumber,
          expiredDate: new Date(dto.expiredDate),
          quantity: dto.quantity,
        },
      })

      const beforeStock = product.stock
      const afterStock = beforeStock + dto.quantity

      await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          batchId: batch.id,
          movementType: 'IN',
          quantity: dto.quantity,
          beforeStock,
          afterStock,
          notes: dto.notes,
          createdById: userId,
        },
      })

      await tx.product.update({
        where: { id: dto.productId },
        data: { stock: { increment: dto.quantity } },
      })

      return batch
    })
  }

  async stockOut(dto: StockOutDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: dto.productId } })
      if (!product) throw new NotFoundException('Produk tidak ditemukan')
      if (product.stock < dto.quantity)
        throw new BadRequestException(`Stok tidak mencukupi. Stok saat ini: ${product.stock}`)

      if (dto.batchId) {
        const batch = await tx.productBatch.findUnique({ where: { id: dto.batchId } })
        if (!batch) throw new NotFoundException('Batch tidak ditemukan')
        if (batch.quantity < dto.quantity)
          throw new BadRequestException(`Stok batch tidak mencukupi. Stok batch: ${batch.quantity}`)
        await tx.productBatch.update({
          where: { id: dto.batchId },
          data: { quantity: { decrement: dto.quantity } },
        })
      }

      const beforeStock = product.stock
      const afterStock = beforeStock - dto.quantity

      await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          batchId: dto.batchId,
          movementType: 'OUT',
          quantity: dto.quantity,
          beforeStock,
          afterStock,
          notes: dto.notes,
          createdById: userId,
        },
      })

      await tx.product.update({
        where: { id: dto.productId },
        data: { stock: { decrement: dto.quantity } },
      })
    })
  }

  async adjustment(dto: AdjustmentDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: dto.productId } })
      if (!product) throw new NotFoundException('Produk tidak ditemukan')

      const afterStock = product.stock + dto.quantity
      if (afterStock < 0)
        throw new BadRequestException(`Stok tidak boleh minus. Stok saat ini: ${product.stock}`)

      await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          movementType: 'ADJUSTMENT',
          quantity: dto.quantity,
          beforeStock: product.stock,
          afterStock,
          notes: dto.notes,
          createdById: userId,
        },
      })

      await tx.product.update({
        where: { id: dto.productId },
        data: { stock: afterStock },
      })
    })
  }

  async opname(dto: OpnameDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: dto.productId } })
      if (!product) throw new NotFoundException('Produk tidak ditemukan')

      const difference = dto.physicalCount - product.stock

      await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          movementType: 'OPNAME',
          quantity: difference,
          beforeStock: product.stock,
          afterStock: dto.physicalCount,
          notes: dto.notes ?? `Opname: sistem ${product.stock} → fisik ${dto.physicalCount}`,
          createdById: userId,
        },
      })

      await tx.product.update({
        where: { id: dto.productId },
        data: { stock: dto.physicalCount },
      })

      return { difference, beforeStock: product.stock, afterStock: dto.physicalCount }
    })
  }
}
