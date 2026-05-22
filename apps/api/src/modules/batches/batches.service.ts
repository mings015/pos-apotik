import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class BatchQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  productId?: string

  @IsOptional()
  @IsString()
  expiredStatus?: 'expired' | 'near_expired' | 'safe'
}

@Injectable()
export class BatchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: BatchQueryDto) {
    const { page = 1, limit = 10, search, productId, expiredStatus } = query
    const skip = (page - 1) * limit
    const today = new Date()
    const thirtyDaysLater = new Date(today)
    thirtyDaysLater.setDate(today.getDate() + 30)

    const where: Record<string, unknown> = {}
    if (productId) where.productId = productId

    if (expiredStatus === 'expired') {
      where.expiredDate = { lt: today }
    } else if (expiredStatus === 'near_expired') {
      where.expiredDate = { gte: today, lte: thirtyDaysLater }
    } else if (expiredStatus === 'safe') {
      where.expiredDate = { gt: thirtyDaysLater }
    }

    if (search) {
      where.OR = [
        { batchNumber: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { code: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.productBatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expiredDate: 'asc' },
        include: {
          product: {
            select: { id: true, code: true, name: true, unit: { select: { symbol: true } } },
          },
        },
      }),
      this.prisma.productBatch.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }
}
