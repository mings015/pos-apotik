import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import type { Prisma } from '@prisma/client'
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto'
import { QueryPurchaseReturnDto } from './dto/query-purchase-return.dto'

@Injectable()
export class PurchaseReturnsService {
  constructor(private prisma: PrismaService) {}

  private async generateReturnNumber(): Promise<string> {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 86400000)
    const count = await this.prisma.purchaseReturn.count({
      where: { createdAt: { gte: startOfDay, lt: endOfDay } },
    })
    return `RTN-${dateStr}-${String(count + 1).padStart(4, '0')}`
  }

  async create(dto: CreatePurchaseReturnDto, userId: string) {
    const invoice = await this.prisma.supplierInvoice.findUnique({
      where: { id: dto.supplierInvoiceId },
      include: {
        purchaseOrder: {
          include: {
            receivings: {
              include: { items: true },
            },
          },
        },
      },
    })
    if (!invoice) throw new NotFoundException('Invoice supplier tidak ditemukan')

    const receivingItems = invoice.purchaseOrder.receivings.flatMap((r) => r.items)

    for (const returnItem of dto.items) {
      const receivingItem = receivingItems.find(
        (ri) => ri.productId === returnItem.productId && ri.batchId === returnItem.batchId,
      )
      if (!receivingItem) throw new BadRequestException(`Produk/batch tidak ada dalam penerimaan barang terkait`)

      const alreadyReturned = await this.prisma.purchaseReturnItem.aggregate({
        where: { batchId: returnItem.batchId, productId: returnItem.productId },
        _sum: { quantity: true },
      })
      const totalReturned = alreadyReturned._sum.quantity ?? 0
      const available = receivingItem.quantity - totalReturned
      if (returnItem.quantity > available) {
        throw new BadRequestException(`Jumlah retur melebihi sisa yang bisa diretur (maks: ${available})`)
      }

      const batch = await this.prisma.productBatch.findUnique({ where: { id: returnItem.batchId } })
      if (!batch || batch.quantity < returnItem.quantity) {
        throw new BadRequestException(`Stok batch tidak mencukupi untuk retur`)
      }
    }

    const returnNumber = await this.generateReturnNumber()

    return this.prisma.$transaction(async (tx) => {
      const purchaseReturn = await tx.purchaseReturn.create({
        data: {
          returnNumber,
          supplierInvoiceId: dto.supplierInvoiceId,
          reason: dto.reason,
          notes: dto.notes,
          createdById: userId,
        },
      })

      for (const returnItem of dto.items) {
        await tx.purchaseReturnItem.create({
          data: {
            purchaseReturnId: purchaseReturn.id,
            productId: returnItem.productId,
            batchId: returnItem.batchId,
            quantity: returnItem.quantity,
          },
        })

        await tx.productBatch.update({
          where: { id: returnItem.batchId },
          data: { quantity: { decrement: returnItem.quantity } },
        })

        const product = await tx.product.findUnique({ where: { id: returnItem.productId } })
        const beforeStock = product!.stock

        await tx.product.update({
          where: { id: returnItem.productId },
          data: { stock: { decrement: returnItem.quantity } },
        })

        await tx.stockMovement.create({
          data: {
            productId: returnItem.productId,
            batchId: returnItem.batchId,
            movementType: 'RETURN',
            quantity: returnItem.quantity,
            beforeStock,
            afterStock: beforeStock - returnItem.quantity,
            referenceType: 'PURCHASE_RETURN',
            referenceId: purchaseReturn.id,
            notes: `Retur pembelian ${returnNumber}`,
            createdById: userId,
          },
        })
      }

      return tx.purchaseReturn.findUnique({
        where: { id: purchaseReturn.id },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, code: true } },
              batch: { select: { id: true, batchNumber: true } },
            },
          },
          createdBy: { select: { id: true, name: true } },
          supplierInvoice: {
            select: {
              id: true,
              invoiceNumber: true,
              purchaseOrder: { select: { id: true, poNumber: true, supplier: { select: { id: true, name: true } } } },
            },
          },
        },
      })
    })
  }

  async findAll(query: QueryPurchaseReturnDto) {
    const { page = 1, limit = 10, supplierInvoiceId, dateFrom, dateTo } = query
    const skip = (page - 1) * limit

    const where: Prisma.PurchaseReturnWhereInput = {}
    if (supplierInvoiceId) where.supplierInvoiceId = supplierInvoiceId
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(dateFrom)
      if (dateTo) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(dateTo + 'T23:59:59.999Z')
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseReturn.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { items: true } },
          supplierInvoice: {
            select: {
              id: true,
              invoiceNumber: true,
              purchaseOrder: { select: { poNumber: true, supplier: { select: { name: true } } } },
            },
          },
        },
      }),
      this.prisma.purchaseReturn.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const pr = await this.prisma.purchaseReturn.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, code: true } },
            batch: { select: { id: true, batchNumber: true } },
          },
        },
        createdBy: { select: { id: true, name: true } },
        supplierInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            purchaseOrder: { select: { id: true, poNumber: true, supplier: { select: { id: true, name: true } } } },
          },
        },
      },
    })
    if (!pr) throw new NotFoundException('Purchase return tidak ditemukan')
    return pr
  }
}
