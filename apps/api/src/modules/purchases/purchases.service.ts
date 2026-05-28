import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import type { Prisma, PurchaseOrderStatus } from '@prisma/client'
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto'
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto'
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto'

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  private async generatePoNumber(): Promise<string> {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 86400000)
    const count = await this.prisma.purchaseOrder.count({
      where: { createdAt: { gte: startOfDay, lt: endOfDay } },
    })
    return `PO-${dateStr}-${String(count + 1).padStart(4, '0')}`
  }

  async create(dto: CreatePurchaseOrderDto, userId: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.supplierId } })
    if (!supplier || !supplier.isActive) throw new NotFoundException('Supplier tidak ditemukan atau tidak aktif')

    const productIds = dto.items.map((i) => i.productId)
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    })
    if (products.length !== productIds.length) throw new BadRequestException('Satu atau lebih produk tidak valid')

    const poNumber = await this.generatePoNumber()
    let subtotal = 0
    const itemsData = dto.items.map((item) => {
      const itemSubtotal = item.quantity * item.purchasePrice
      subtotal += itemSubtotal
      return {
        productId: item.productId,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        subtotal: itemSubtotal,
      }
    })

    const tax = dto.tax ?? 0
    const discount = dto.discount ?? 0
    const total = subtotal + tax - discount

    return this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: dto.supplierId,
        subtotal,
        tax,
        discount,
        total,
        notes: dto.notes,
        createdById: userId,
        items: { create: itemsData },
      },
      include: {
        supplier: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, code: true, unit: { select: { symbol: true } } } },
          },
        },
      },
    })
  }

  async findAll(query: QueryPurchaseOrderDto) {
    const { page = 1, limit = 10, status, supplierId, search, dateFrom, dateTo } = query
    const skip = (page - 1) * limit

    const where: Prisma.PurchaseOrderWhereInput = {}
    if (status) where.status = status as PurchaseOrderStatus
    if (supplierId) where.supplierId = supplierId
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(dateFrom)
      if (dateTo) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(dateTo + 'T23:59:59.999Z')
    }
    if (search) {
      where.OR = [
        { poNumber: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, name: true, phone: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        items: {
          include: {
            product: {
              select: { id: true, name: true, code: true, unit: { select: { symbol: true } } },
            },
          },
        },
        receivings: {
          include: {
            receivedBy: { select: { id: true, name: true } },
            items: {
              include: {
                product: { select: { id: true, name: true, code: true } },
                batch: { select: { id: true, batchNumber: true, expiredDate: true } },
              },
            },
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            paidAmount: true,
            dueDate: true,
            paymentStatus: true,
            payments: {
              select: {
                id: true,
                amount: true,
                paymentMethod: true,
                paymentDate: true,
                notes: true,
                createdBy: { select: { id: true, name: true } },
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    })
    if (!po) throw new NotFoundException('Purchase order tidak ditemukan')
    return po
  }

  async updateStatus(id: string, dto: UpdatePurchaseOrderDto) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { receivings: true },
    })
    if (!po) throw new NotFoundException('Purchase order tidak ditemukan')

    if (dto.status) {
      const validTransitions: Record<string, string[]> = {
        DRAFT: ['PENDING', 'CANCELLED'],
        PENDING: ['APPROVED', 'CANCELLED'],
        APPROVED: ['CANCELLED'],
        RECEIVED: [],
        CANCELLED: [],
      }
      const allowed = validTransitions[po.status] ?? []
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(`Tidak bisa mengubah status dari ${po.status} ke ${dto.status}`)
      }
      if (dto.status === 'CANCELLED' && po.status === 'APPROVED' && po.receivings.length > 0) {
        throw new BadRequestException('Tidak bisa membatalkan PO yang sudah diterima')
      }
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status as PurchaseOrderStatus } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
      include: {
        supplier: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })
  }
}
