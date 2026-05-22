import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 10, search } = query
    const skip = (page - 1) * limit
    const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {}

    const [data, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.category.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) throw new NotFoundException('Kategori tidak ditemukan')
    return category
  }

  async create(dto: CreateCategoryDto) {
    const exists = await this.prisma.category.findUnique({ where: { name: dto.name } })
    if (exists) throw new ConflictException('Nama kategori sudah digunakan')
    return this.prisma.category.create({ data: dto })
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id)
    if (dto.name) {
      const exists = await this.prisma.category.findFirst({
        where: { name: dto.name, NOT: { id } },
      })
      if (exists) throw new ConflictException('Nama kategori sudah digunakan')
    }
    return this.prisma.category.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.category.delete({ where: { id } })
  }
}
