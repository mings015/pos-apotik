import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateUnitDto } from './dto/create-unit.dto'
import { UpdateUnitDto } from './dto/update-unit.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 10, search } = query
    const skip = (page - 1) * limit
    const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {}

    const [data, total] = await this.prisma.$transaction([
      this.prisma.unit.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.unit.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id } })
    if (!unit) throw new NotFoundException('Satuan tidak ditemukan')
    return unit
  }

  async create(dto: CreateUnitDto) {
    const exists = await this.prisma.unit.findUnique({ where: { name: dto.name } })
    if (exists) throw new ConflictException('Nama satuan sudah digunakan')
    return this.prisma.unit.create({ data: dto })
  }

  async update(id: string, dto: UpdateUnitDto) {
    await this.findOne(id)
    if (dto.name) {
      const exists = await this.prisma.unit.findFirst({ where: { name: dto.name, NOT: { id } } })
      if (exists) throw new ConflictException('Nama satuan sudah digunakan')
    }
    return this.prisma.unit.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.unit.delete({ where: { id } })
  }
}
