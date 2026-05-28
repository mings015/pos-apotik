import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { QueryReportDto } from './dto/query-reports.dto'

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private dateRange(dateFrom?: string, dateTo?: string) {
    const from = dateFrom ? new Date(dateFrom) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : new Date()
    return { from, to }
  }

  async getSalesReport(query: QueryReportDto) {
    const { page = 1, limit = 25, cashierId, paymentMethod, dateFrom, dateTo } = query
    const skip = (page - 1) * limit
    const { from, to } = this.dateRange(dateFrom, dateTo)

    const where: Prisma.SaleWhereInput = {
      status: 'COMPLETED',
      createdAt: { gte: from, lte: to },
      ...(cashierId && { cashierId }),
      ...(paymentMethod && { paymentMethod }),
    }

    const [sales, total, summary] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          cashier: { select: { name: true } },
          subtotal: true,
          discount: true,
          tax: true,
          total: true,
          paymentMethod: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      }),
      this.prisma.sale.count({ where }),
      this.prisma.sale.aggregate({ where, _sum: { total: true }, _count: { id: true } }),
    ])

    return {
      data: sales.map(s => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        cashier: s.cashier.name,
        itemCount: s._count.items,
        subtotal: Number(s.subtotal),
        discount: Number(s.discount),
        tax: Number(s.tax),
        total: Number(s.total),
        paymentMethod: s.paymentMethod,
        createdAt: s.createdAt,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      summary: {
        totalTransactions: summary._count.id,
        totalRevenue: Number(summary._sum.total ?? 0),
        avgTransaction: summary._count.id > 0 ? Number(summary._sum.total ?? 0) / summary._count.id : 0,
      },
    }
  }

  async getProfitReport(query: QueryReportDto) {
    const { page = 1, limit = 25, dateFrom, dateTo, categoryId } = query
    const skip = (page - 1) * limit
    const { from, to } = this.dateRange(dateFrom, dateTo)
    const catFilter = categoryId ? Prisma.sql`AND p.category_id = ${categoryId}` : Prisma.empty

    const [data, totalRaw, summaryRaw] = await Promise.all([
      this.prisma.$queryRaw<Array<{
        name: string; code: string; category: string
        quantity_sold: number; revenue: number; purchase_cost: number; profit: number
      }>>`
        SELECT p.name, p.code, c.name as category,
          SUM(si.quantity)::int as quantity_sold,
          SUM(si.subtotal)::float as revenue,
          SUM(si.quantity * p.purchase_price)::float as purchase_cost,
          SUM(si.subtotal - si.quantity * p.purchase_price)::float as profit
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.status = 'COMPLETED' AND s.created_at BETWEEN ${from} AND ${to}
        ${catFilter}
        GROUP BY p.id, p.name, p.code, c.name
        ORDER BY profit DESC
        LIMIT ${limit} OFFSET ${skip}
      `,
      this.prisma.$queryRaw<[{ total: number }]>`
        SELECT COUNT(DISTINCT si.product_id)::int as total
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.status = 'COMPLETED' AND s.created_at BETWEEN ${from} AND ${to}
        ${catFilter}
      `,
      this.prisma.$queryRaw<[{ revenue: number; purchase_cost: number; profit: number }]>`
        SELECT SUM(si.subtotal)::float as revenue,
          SUM(si.quantity * p.purchase_price)::float as purchase_cost,
          SUM(si.subtotal - si.quantity * p.purchase_price)::float as profit
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.status = 'COMPLETED' AND s.created_at BETWEEN ${from} AND ${to}
        ${catFilter}
      `,
    ])

    const total = Number(totalRaw[0]?.total ?? 0)
    const s = summaryRaw[0]

    return {
      data: data.map(r => ({
        name: r.name,
        code: r.code,
        category: r.category,
        quantitySold: Number(r.quantity_sold),
        revenue: Number(r.revenue),
        purchaseCost: Number(r.purchase_cost),
        profit: Number(r.profit),
        margin: Number(r.revenue) > 0 ? (Number(r.profit) / Number(r.revenue)) * 100 : 0,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      summary: {
        totalRevenue: Number(s?.revenue ?? 0),
        totalPurchaseCost: Number(s?.purchase_cost ?? 0),
        totalProfit: Number(s?.profit ?? 0),
        margin: Number(s?.revenue) > 0 ? (Number(s?.profit ?? 0) / Number(s?.revenue ?? 1)) * 100 : 0,
      },
    }
  }

  async getStocksReport(query: QueryReportDto) {
    const { page = 1, limit = 25, categoryId, supplierId, stockStatus } = query
    const skip = (page - 1) * limit

    const stockFilter =
      stockStatus === 'out' ? Prisma.sql`AND p.stock = 0`
      : stockStatus === 'low' ? Prisma.sql`AND p.stock > 0 AND p.stock <= p.minimum_stock`
      : stockStatus === 'normal' ? Prisma.sql`AND p.stock > p.minimum_stock`
      : Prisma.empty

    const catFilter = categoryId ? Prisma.sql`AND p.category_id = ${categoryId}` : Prisma.empty
    const supFilter = supplierId ? Prisma.sql`AND p.supplier_id = ${supplierId}` : Prisma.empty

    const [data, totalRaw, summaryRaw] = await Promise.all([
      this.prisma.$queryRaw<Array<{
        id: string; name: string; code: string; category: string
        stock: number; minimum_stock: number; purchase_price: number; stock_value: number
      }>>`
        SELECT p.id, p.name, p.code, c.name as category,
          p.stock, p.minimum_stock, p.purchase_price::float,
          (p.stock * p.purchase_price)::float as stock_value
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        ${catFilter} ${supFilter} ${stockFilter}
        ORDER BY p.name ASC
        LIMIT ${limit} OFFSET ${skip}
      `,
      this.prisma.$queryRaw<[{ total: number }]>`
        SELECT COUNT(p.id)::int as total
        FROM products p
        WHERE p.is_active = true
        ${catFilter} ${supFilter} ${stockFilter}
      `,
      this.prisma.$queryRaw<[{ total_value: number; low_stock: number; out_of_stock: number }]>`
        SELECT
          COALESCE(SUM(p.stock * p.purchase_price), 0)::float as total_value,
          COUNT(CASE WHEN p.stock > 0 AND p.stock <= p.minimum_stock THEN 1 END)::int as low_stock,
          COUNT(CASE WHEN p.stock = 0 THEN 1 END)::int as out_of_stock
        FROM products p
        WHERE p.is_active = true
        ${catFilter} ${supFilter}
      `,
    ])

    const total = Number(totalRaw[0]?.total ?? 0)
    const s = summaryRaw[0]

    return {
      data: data.map(r => ({
        id: r.id,
        name: r.name,
        code: r.code,
        category: r.category,
        stock: Number(r.stock),
        minimumStock: Number(r.minimum_stock),
        purchasePrice: Number(r.purchase_price),
        stockValue: Number(r.stock_value),
        status: Number(r.stock) === 0 ? 'out' : Number(r.stock) <= Number(r.minimum_stock) ? 'low' : 'normal',
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      summary: {
        totalValue: Number(s?.total_value ?? 0),
        lowStock: Number(s?.low_stock ?? 0),
        outOfStock: Number(s?.out_of_stock ?? 0),
      },
    }
  }

  async getExpiredReport(query: QueryReportDto) {
    const { page = 1, limit = 25, categoryId, supplierId, status } = query
    const skip = (page - 1) * limit
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const dateFilter =
      status === 'expired' ? Prisma.sql`AND pb.expired_date <= ${now}`
      : status === 'near_expired' ? Prisma.sql`AND pb.expired_date > ${now} AND pb.expired_date <= ${thirtyDaysFromNow}`
      : Prisma.sql`AND pb.expired_date <= ${thirtyDaysFromNow}`

    const catFilter = categoryId ? Prisma.sql`AND p.category_id = ${categoryId}` : Prisma.empty
    const supFilter = supplierId ? Prisma.sql`AND p.supplier_id = ${supplierId}` : Prisma.empty

    const [data, totalRaw] = await Promise.all([
      this.prisma.$queryRaw<Array<{
        batch_id: string; product_name: string; code: string; category: string
        batch_number: string; expired_date: Date; quantity: number; status: string
      }>>`
        SELECT pb.id as batch_id, p.name as product_name, p.code, c.name as category,
          pb.batch_number, pb.expired_date, pb.quantity,
          CASE WHEN pb.expired_date <= ${now} THEN 'expired' ELSE 'near_expired' END as status
        FROM product_batches pb
        JOIN products p ON pb.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE pb.quantity > 0
        ${dateFilter} ${catFilter} ${supFilter}
        ORDER BY pb.expired_date ASC
        LIMIT ${limit} OFFSET ${skip}
      `,
      this.prisma.$queryRaw<[{ total: number }]>`
        SELECT COUNT(pb.id)::int as total
        FROM product_batches pb
        JOIN products p ON pb.product_id = p.id
        WHERE pb.quantity > 0
        ${dateFilter} ${catFilter} ${supFilter}
      `,
    ])

    const total = Number(totalRaw[0]?.total ?? 0)

    return {
      data: data.map(r => ({
        batchId: r.batch_id,
        productName: r.product_name,
        code: r.code,
        category: r.category,
        batchNumber: r.batch_number,
        expiredDate: r.expired_date,
        quantity: Number(r.quantity),
        status: r.status,
        daysUntilExpiry: Math.ceil((new Date(r.expired_date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async getCashiersReport(query: QueryReportDto) {
    const { page = 1, limit = 25, dateFrom, dateTo, cashierId } = query
    const skip = (page - 1) * limit
    const { from, to } = this.dateRange(dateFrom, dateTo)
    const cashierFilter = cashierId ? Prisma.sql`AND u.id = ${cashierId}` : Prisma.empty

    const [data, totalRaw, summaryRaw] = await Promise.all([
      this.prisma.$queryRaw<Array<{
        cashier_id: string; name: string; transactions: number; revenue: number; avg_transaction: number
      }>>`
        SELECT u.id as cashier_id, u.name,
          COUNT(s.id)::int as transactions,
          COALESCE(SUM(s.total), 0)::float as revenue,
          COALESCE(AVG(s.total), 0)::float as avg_transaction
        FROM users u
        JOIN sales s ON s.cashier_id = u.id
        WHERE s.status = 'COMPLETED' AND s.created_at BETWEEN ${from} AND ${to}
        ${cashierFilter}
        GROUP BY u.id, u.name
        ORDER BY revenue DESC
        LIMIT ${limit} OFFSET ${skip}
      `,
      this.prisma.$queryRaw<[{ total: number }]>`
        SELECT COUNT(DISTINCT s.cashier_id)::int as total
        FROM sales s
        WHERE s.status = 'COMPLETED' AND s.created_at BETWEEN ${from} AND ${to}
        ${cashierFilter}
      `,
      this.prisma.$queryRaw<[{ revenue: number; transactions: number }]>`
        SELECT COALESCE(SUM(s.total), 0)::float as revenue, COUNT(s.id)::int as transactions
        FROM sales s
        WHERE s.status = 'COMPLETED' AND s.created_at BETWEEN ${from} AND ${to}
        ${cashierFilter}
      `,
    ])

    const total = Number(totalRaw[0]?.total ?? 0)
    const s = summaryRaw[0]

    return {
      data: data.map(r => ({
        cashierId: r.cashier_id,
        name: r.name,
        transactions: Number(r.transactions),
        revenue: Number(r.revenue),
        avgTransaction: Number(r.avg_transaction),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      summary: {
        totalRevenue: Number(s?.revenue ?? 0),
        totalTransactions: Number(s?.transactions ?? 0),
      },
    }
  }
}
