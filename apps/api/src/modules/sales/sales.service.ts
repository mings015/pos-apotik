import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateSaleDto } from './dto/create-sale.dto'
import { CheckoutHoldDto } from './dto/checkout-hold.dto'
import { QuerySaleDto } from './dto/query-sale.dto'
import type { Prisma } from '@prisma/client'

type TxClient = Omit<PrismaService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const count = await this.prisma.sale.count({ where: { createdAt: { gte: start, lt: end } } })
    return `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`
  }

  private async deductStockFifo(
    tx: TxClient,
    productId: string,
    quantity: number,
    saleId: string,
    cashierId: string,
  ) {
    // Lock row to prevent concurrent oversell (SELECT FOR UPDATE)
    await tx.$executeRaw`SELECT id FROM products WHERE id = ${productId} FOR UPDATE`

    const product = await tx.product.findUnique({ where: { id: productId } })
    if (!product) throw new NotFoundException('Produk tidak ditemukan')
    if (product.stock < quantity)
      throw new BadRequestException(`Stok ${product.name} tidak mencukupi (tersedia: ${product.stock})`)

    let remaining = quantity
    const batches = await tx.productBatch.findMany({
      where: { productId, quantity: { gt: 0 }, expiredDate: { gte: new Date() } },
      orderBy: { expiredDate: 'asc' },
    })

    for (const batch of batches) {
      if (remaining <= 0) break
      const deduct = Math.min(batch.quantity, remaining)
      remaining -= deduct
      await tx.productBatch.update({
        where: { id: batch.id },
        data: { quantity: { decrement: deduct } },
      })
    }

    if (remaining > 0)
      throw new BadRequestException(`Stok ${product.name} tidak mencukupi di batch yang valid`)

    const beforeStock = product.stock
    const afterStock = beforeStock - quantity

    await tx.product.update({ where: { id: productId }, data: { stock: { decrement: quantity } } })

    await tx.stockMovement.create({
      data: {
        productId,
        movementType: 'OUT',
        quantity,
        beforeStock,
        afterStock,
        referenceType: 'SALE',
        referenceId: saleId,
        notes: `Penjualan invoice`,
        createdById: cashierId,
      },
    })
  }

  async create(dto: CreateSaleDto, cashierId: string) {
    if (!dto.items?.length) throw new BadRequestException('Keranjang tidak boleh kosong')

    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0
      const itemsData: Array<{ productId: string; quantity: number; price: number; discount: number; subtotal: number }> = []

      for (const item of dto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (!product || !product.isActive)
          throw new NotFoundException(`Produk tidak ditemukan atau tidak aktif`)

        if (dto.status !== 'HOLD' && product.stock < item.quantity)
          throw new BadRequestException(`Stok ${product.name} tidak mencukupi`)

        const itemDiscount = item.discount ?? 0
        const itemSubtotal = item.price * item.quantity - itemDiscount
        subtotal += itemSubtotal
        itemsData.push({ productId: item.productId, quantity: item.quantity, price: item.price, discount: itemDiscount, subtotal: itemSubtotal })
      }

      const cartDiscount = dto.discount ?? 0
      const taxBase = subtotal - cartDiscount
      const setting = await tx.setting.findFirst()
      const taxRate = Number(setting?.taxPercentage ?? 0) / 100
      const tax = Math.round(taxBase * taxRate)
      const total = taxBase + tax

      if (dto.status !== 'HOLD' && dto.paymentMethod === 'CASH') {
        if (!dto.amountPaid || dto.amountPaid < total)
          throw new BadRequestException('Jumlah bayar kurang dari total')
      }

      const invoiceNumber = await this.generateInvoiceNumber()
      const change = dto.paymentMethod === 'CASH' && dto.amountPaid ? dto.amountPaid - total : null

      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          cashierId,
          subtotal,
          discount: cartDiscount,
          tax,
          total,
          paymentMethod: dto.paymentMethod ?? null,
          amountPaid: dto.amountPaid ?? null,
          change,
          status: (dto.status ?? 'COMPLETED') as 'HOLD' | 'COMPLETED' | 'CANCELLED',
          notes: dto.notes,
          items: { create: itemsData },
        },
        include: {
          items: { include: { product: { select: { name: true, code: true, unit: { select: { symbol: true } } } } } },
          cashier: { select: { id: true, name: true } },
        },
      })

      if (dto.status !== 'HOLD') {
        for (const item of itemsData) {
          await this.deductStockFifo(tx as unknown as TxClient, item.productId, item.quantity, sale.id, cashierId)
        }
      }

      return sale
    })
  }

  async findAll(query: QuerySaleDto) {
    const { page = 1, limit = 20, status, dateFrom, dateTo, cashierId, search } = query
    const skip = (page - 1) * limit
    const where: Prisma.SaleWhereInput = {}

    if (status) where.status = status as 'HOLD' | 'COMPLETED' | 'CANCELLED'
    if (cashierId) where.cashierId = cashierId
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { cashier: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) {
        const d = new Date(dateTo)
        d.setHours(23, 59, 59, 999)
        where.createdAt.lte = d
      }
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cashier: { select: { id: true, name: true } },
          items: { select: { id: true, quantity: true, price: true, subtotal: true, product: { select: { name: true, unit: { select: { symbol: true } } } } } },
        },
      }),
      this.prisma.sale.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        cashier: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, code: true, unit: { select: { name: true, symbol: true } } } },
          },
        },
      },
    })
    if (!sale) throw new NotFoundException('Transaksi tidak ditemukan')
    return sale
  }

  async checkoutHold(id: string, dto: CheckoutHoldDto, cashierId: string) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id }, include: { items: true } })
      if (!sale) throw new NotFoundException('Transaksi tidak ditemukan')
      if (sale.status !== 'HOLD') throw new BadRequestException('Transaksi bukan status HOLD')

      for (const item of sale.items) {
        await this.deductStockFifo(tx as unknown as TxClient, item.productId, item.quantity, sale.id, cashierId)
      }

      const total = Number(sale.total)
      if (dto.paymentMethod === 'CASH') {
        if (!dto.amountPaid || dto.amountPaid < total)
          throw new BadRequestException('Jumlah bayar kurang dari total')
      }
      const change = dto.paymentMethod === 'CASH' && dto.amountPaid ? dto.amountPaid - total : null

      return tx.sale.update({
        where: { id },
        data: { status: 'COMPLETED', paymentMethod: dto.paymentMethod, amountPaid: dto.amountPaid ?? null, change, notes: dto.notes ?? sale.notes },
        include: { cashier: { select: { id: true, name: true } }, items: { include: { product: { select: { name: true, code: true, unit: { select: { symbol: true } } } } } } },
      })
    })
  }

  async cancelHold(id: string) {
    const sale = await this.prisma.sale.findUnique({ where: { id } })
    if (!sale) throw new NotFoundException('Transaksi tidak ditemukan')
    if (sale.status !== 'HOLD') throw new BadRequestException('Hanya transaksi HOLD yang dapat dibatalkan')
    return this.prisma.sale.update({ where: { id }, data: { status: 'CANCELLED' } })
  }

  async deleteSale(id: string, userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User tidak ditemukan')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new UnauthorizedException('Password tidak valid')

    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id }, include: { items: true } })
      if (!sale) throw new NotFoundException('Transaksi tidak ditemukan')

      if (sale.status === 'COMPLETED') {
        for (const item of sale.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } })
          if (!product) continue
          const afterStock = product.stock + item.quantity
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              movementType: 'RETURN',
              quantity: item.quantity,
              beforeStock: product.stock,
              afterStock,
              referenceType: 'SALE_DELETE',
              referenceId: id,
              notes: `Penghapusan transaksi ${sale.invoiceNumber}`,
              createdById: userId,
            },
          })
        }
      }

      return tx.sale.delete({ where: { id } })
    })
  }
}
