import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateGoodsReceivingDto } from './dto/create-goods-receiving.dto'

@Injectable()
export class GoodsReceivingService {
  constructor(private prisma: PrismaService) {}

  private async generateInvoiceNumber(poNumber: string): Promise<string> {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 86400000)
    const count = await this.prisma.supplierInvoice.count({
      where: { createdAt: { gte: startOfDay, lt: endOfDay } },
    })
    return `SINV-${dateStr}-${String(count + 1).padStart(4, '0')}`
  }

  async receive(dto: CreateGoodsReceivingDto, userId: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: dto.purchaseOrderId },
      include: { items: true, receivings: true },
    })
    if (!po) throw new NotFoundException('Purchase order tidak ditemukan')
    if (po.status !== 'APPROVED') throw new BadRequestException('Purchase order harus berstatus APPROVED untuk diterima')
    if (po.receivings.length > 0) throw new ConflictException('Purchase order sudah pernah diterima')

    const expiredDate = new Date()
    for (const item of dto.items) {
      const itemDate = new Date(item.expiredDate)
      if (itemDate <= expiredDate) throw new BadRequestException(`Tanggal kadaluarsa produk tidak valid`)
      const poItem = po.items.find((pi) => pi.productId === item.productId)
      if (!poItem) throw new BadRequestException(`Produk tidak ada dalam purchase order`)
      if (item.quantity > poItem.quantity) throw new BadRequestException(`Jumlah terima melebihi jumlah PO untuk produk`)
    }

    const invoiceNumber = await this.generateInvoiceNumber(po.poNumber)

    return this.prisma.$transaction(async (tx) => {
      const gr = await tx.goodsReceiving.create({
        data: {
          purchaseOrderId: dto.purchaseOrderId,
          receivedById: userId,
          notes: dto.notes,
        },
      })

      for (const item of dto.items) {
        const batch = await tx.productBatch.create({
          data: {
            productId: item.productId,
            batchNumber: item.batchNumber,
            expiredDate: new Date(item.expiredDate),
            quantity: item.quantity,
          },
        })

        const product = await tx.product.findUnique({ where: { id: item.productId } })
        const beforeStock = product!.stock

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            batchId: batch.id,
            movementType: 'IN',
            quantity: item.quantity,
            beforeStock,
            afterStock: beforeStock + item.quantity,
            referenceType: 'GOODS_RECEIVING',
            referenceId: gr.id,
            notes: `Penerimaan barang PO ${po.poNumber}`,
            createdById: userId,
          },
        })

        await tx.goodsReceivingItem.create({
          data: {
            goodsReceivingId: gr.id,
            productId: item.productId,
            batchId: batch.id,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
          },
        })
      }

      await tx.purchaseOrder.update({
        where: { id: dto.purchaseOrderId },
        data: { status: 'RECEIVED' },
      })

      const invoice = await tx.supplierInvoice.create({
        data: {
          purchaseOrderId: dto.purchaseOrderId,
          invoiceNumber,
          totalAmount: po.total,
          paidAmount: 0,
          paymentStatus: 'UNPAID',
        },
      })

      return tx.goodsReceiving.findUnique({
        where: { id: gr.id },
        include: {
          receivedBy: { select: { id: true, name: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, code: true } },
              batch: { select: { id: true, batchNumber: true, expiredDate: true } },
            },
          },
          purchaseOrder: { select: { id: true, poNumber: true, status: true } },
        },
      })
    })
  }

  async findByPurchaseOrder(purchaseOrderId: string) {
    const gr = await this.prisma.goodsReceiving.findFirst({
      where: { purchaseOrderId },
      include: {
        receivedBy: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, code: true } },
            batch: { select: { id: true, batchNumber: true, expiredDate: true } },
          },
        },
      },
    })
    if (!gr) throw new NotFoundException('Penerimaan barang tidak ditemukan')
    return gr
  }
}
