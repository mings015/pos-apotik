import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class StockMovementQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  productId?: string

  @IsOptional()
  @IsString()
  movementType?: string

  @IsOptional()
  @IsString()
  dateFrom?: string

  @IsOptional()
  @IsString()
  dateTo?: string
}

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: StockMovementQueryDto) {
    const { page = 1, limit = 10, productId, movementType, dateFrom, dateTo } = query
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (productId) where.productId = productId
    if (movementType) where.movementType = movementType
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo + 'T23:59:59.999Z') } : {}),
      }
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, code: true, name: true } },
          batch: { select: { id: true, batchNumber: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.stockMovement.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }
}
