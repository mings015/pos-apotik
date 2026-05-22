import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { QueryProductDto } from './dto/query-product.dto'

const productSelect = {
  id: true,
  code: true,
  barcode: true,
  name: true,
  categoryId: true,
  supplierId: true,
  unitId: true,
  purchasePrice: true,
  sellingPrice: true,
  stock: true,
  minimumStock: true,
  productImage: true,
  description: true,
  isActive: true,
  category: true,
  supplier: true,
  unit: true,
  createdAt: true,
  updatedAt: true,
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const { page = 1, limit = 10, search, categoryId, supplierId, isActive } = query
    const skip = (page - 1) * limit

    const where = {
      ...(categoryId && { categoryId }),
      ...(supplierId && { supplierId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
          { barcode: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        select: productSelect,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, select: productSelect })
    if (!product) throw new NotFoundException('Produk tidak ditemukan')
    return product
  }

  async create(dto: CreateProductDto, imageFilename?: string) {
    const codeExists = await this.prisma.product.findUnique({ where: { code: dto.code } })
    if (codeExists) throw new ConflictException('Kode produk sudah digunakan')

    if (dto.barcode) {
      const barcodeExists = await this.prisma.product.findUnique({ where: { barcode: dto.barcode } })
      if (barcodeExists) throw new ConflictException('Barcode sudah digunakan')
    }

    return this.prisma.product.create({
      data: { ...dto, productImage: imageFilename ?? null },
      select: productSelect,
    })
  }

  async update(id: string, dto: UpdateProductDto, imageFilename?: string) {
    await this.findOne(id)

    if (dto.code) {
      const exists = await this.prisma.product.findFirst({ where: { code: dto.code, NOT: { id } } })
      if (exists) throw new ConflictException('Kode produk sudah digunakan')
    }

    return this.prisma.product.update({
      where: { id },
      data: { ...dto, ...(imageFilename && { productImage: imageFilename }) },
      select: productSelect,
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.product.delete({ where: { id } })
  }
}
