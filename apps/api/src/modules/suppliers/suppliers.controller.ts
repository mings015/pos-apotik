import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { SuppliersService } from './suppliers.service'
import { CreateSupplierDto } from './dto/create-supplier.dto'
import { UpdateSupplierDto } from './dto/update-supplier.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const data = await this.suppliersService.findAll(query)
    return { success: true, message: 'Daftar supplier berhasil diambil', data }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.suppliersService.findOne(id)
    return { success: true, message: 'Supplier berhasil diambil', data }
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() dto: CreateSupplierDto) {
    const data = await this.suppliersService.create(dto)
    return { success: true, message: 'Supplier berhasil ditambahkan', data }
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    const data = await this.suppliersService.update(id, dto)
    return { success: true, message: 'Supplier berhasil diperbarui', data }
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async remove(@Param('id') id: string) {
    await this.suppliersService.remove(id)
    return { success: true, message: 'Supplier berhasil dihapus' }
  }
}
