import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

const userSelect = {
  id: true,
  name: true,
  email: true,
  roleId: true,
  isActive: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 10, search } = query
    const skip = (page - 1) * limit
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, select: userSelect, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: userSelect })
    if (!user) throw new NotFoundException('User tidak ditemukan')
    return user
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new ConflictException('Email sudah digunakan')

    const hashed = await bcrypt.hash(dto.password, 10)
    return this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: userSelect,
    })
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id)

    if (dto.email) {
      const exists = await this.prisma.user.findFirst({ where: { email: dto.email, NOT: { id } } })
      if (exists) throw new ConflictException('Email sudah digunakan')
    }

    const data: Record<string, unknown> = { ...dto }
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10)

    return this.prisma.user.update({ where: { id }, data, select: userSelect })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.user.delete({ where: { id } })
  }
}
