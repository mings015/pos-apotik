import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { QuerySupplierInvoiceDto } from './dto/query-supplier-invoice.dto'
import { RecordPaymentDto } from './dto/record-payment.dto'
import { UpdateInvoiceDto } from './dto/update-invoice.dto'

@Injectable()
export class SupplierInvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QuerySupplierInvoiceDto) {
    const { page = 1, limit = 10, paymentStatus, supplierId, dateFrom, dateTo } = query
    const skip = (page - 1) * limit

    const where: any = {}
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (supplierId) where.purchaseOrder = { supplierId }
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.supplierInvoice.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          purchaseOrder: {
            select: {
              id: true,
              poNumber: true,
              supplier: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.supplierInvoice.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const invoice = await this.prisma.supplierInvoice.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          include: {
            supplier: { select: { id: true, name: true, phone: true, email: true } },
            items: {
              include: {
                product: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
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
    })
    if (!invoice) throw new NotFoundException('Invoice supplier tidak ditemukan')
    return invoice
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.prisma.supplierInvoice.findUnique({ where: { id } })
    if (!invoice) throw new NotFoundException('Invoice supplier tidak ditemukan')

    return this.prisma.supplierInvoice.update({
      where: { id },
      data: {
        ...(dto.dueDate ? { dueDate: new Date(dto.dueDate) } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    })
  }

  async recordPayment(id: string, dto: RecordPaymentDto, userId: string) {
    const invoice = await this.prisma.supplierInvoice.findUnique({ where: { id } })
    if (!invoice) throw new NotFoundException('Invoice supplier tidak ditemukan')
    if (invoice.paymentStatus === 'PAID') throw new BadRequestException('Invoice sudah lunas')

    const remaining = Number(invoice.totalAmount) - Number(invoice.paidAmount)
    if (dto.amount > remaining + 0.001) throw new BadRequestException('Jumlah bayar melebihi sisa hutang')

    const newPaidAmount = Number(invoice.paidAmount) + dto.amount
    const totalAmount = Number(invoice.totalAmount)
    const newStatus = newPaidAmount >= totalAmount - 0.001 ? 'PAID' : newPaidAmount > 0 ? 'PARTIAL' : 'UNPAID'

    return this.prisma.$transaction(async (tx) => {
      await tx.supplierPayment.create({
        data: {
          supplierInvoiceId: id,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          paymentDate: new Date(dto.paymentDate),
          notes: dto.notes,
          createdById: userId,
        },
      })

      return tx.supplierInvoice.update({
        where: { id },
        data: { paidAmount: newPaidAmount, paymentStatus: newStatus as any },
        include: {
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
      })
    })
  }
}
