import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [todaySalesAgg, monthSalesAgg, activeProducts, expiredProducts, nearExpiredProducts] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: todayStart } },
        _sum: { total: true },
        _count: { id: true },
      }),
      this.prisma.sale.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
        _sum: { total: true },
        _count: { id: true },
      }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.productBatch.count({ where: { expiredDate: { lte: now }, quantity: { gt: 0 } } }),
      this.prisma.productBatch.count({ where: { expiredDate: { gt: now, lte: thirtyDaysFromNow }, quantity: { gt: 0 } } }),
    ])

    const [lowStockRaw, salesTrendRaw, topProductsRaw, monthProfitRaw, paymentBreakdown] = await Promise.all([
      this.prisma.$queryRaw<[{ count: number }]>`
        SELECT COUNT(*)::int as count FROM products WHERE is_active = true AND stock <= minimum_stock AND stock >= 0
      `,
      this.prisma.$queryRaw<Array<{ date: string; revenue: number; transactions: number }>>`
        SELECT
          TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date,
          COALESCE(SUM(total), 0)::float as revenue,
          COUNT(id)::int as transactions
        FROM sales
        WHERE status = 'COMPLETED' AND created_at >= ${sevenDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      this.prisma.$queryRaw<Array<{ name: string; quantity_sold: number; revenue: number }>>`
        SELECT
          p.name,
          SUM(si.quantity)::int as quantity_sold,
          SUM(si.subtotal)::float as revenue
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.status = 'COMPLETED' AND s.created_at >= ${monthStart}
        GROUP BY p.id, p.name
        ORDER BY quantity_sold DESC
        LIMIT 5
      `,
      this.prisma.$queryRaw<[{ profit: number }]>`
        SELECT COALESCE(SUM(si.subtotal - si.quantity * p.purchase_price), 0)::float as profit
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.status = 'COMPLETED' AND s.created_at >= ${monthStart}
      `,
      this.prisma.sale.groupBy({
        by: ['paymentMethod'],
        where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
        _sum: { total: true },
        _count: { id: true },
      }),
    ])

    return {
      todaySales: Number(todaySalesAgg._sum.total ?? 0),
      todayTransactions: todaySalesAgg._count.id,
      monthSales: Number(monthSalesAgg._sum.total ?? 0),
      monthTransactions: monthSalesAgg._count.id,
      monthProfit: Number(monthProfitRaw[0]?.profit ?? 0),
      activeProducts,
      lowStockProducts: Number(lowStockRaw[0]?.count ?? 0),
      expiredProducts,
      nearExpiredProducts,
      salesTrend: salesTrendRaw.map(r => ({
        date: String(r.date),
        revenue: Number(r.revenue),
        transactions: Number(r.transactions),
      })),
      topProducts: topProductsRaw.map(r => ({
        name: String(r.name),
        quantitySold: Number(r.quantity_sold),
        revenue: Number(r.revenue),
      })),
      paymentBreakdown: paymentBreakdown.map(p => ({
        method: p.paymentMethod ?? 'Lainnya',
        total: Number(p._sum.total ?? 0),
        count: p._count.id,
      })),
    }
  }
}
