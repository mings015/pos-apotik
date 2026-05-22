import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const data = await this.categoriesService.findAll(query)
    return { success: true, message: 'Daftar kategori berhasil diambil', data }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(id)
    return { success: true, message: 'Kategori berhasil diambil', data }
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() dto: CreateCategoryDto) {
    const data = await this.categoriesService.create(dto)
    return { success: true, message: 'Kategori berhasil ditambahkan', data }
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const data = await this.categoriesService.update(id, dto)
    return { success: true, message: 'Kategori berhasil diperbarui', data }
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id)
    return { success: true, message: 'Kategori berhasil dihapus' }
  }
}
