import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { UnitsService } from './units.service'
import { CreateUnitDto } from './dto/create-unit.dto'
import { UpdateUnitDto } from './dto/update-unit.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('units')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnitsController {
  constructor(private unitsService: UnitsService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const data = await this.unitsService.findAll(query)
    return { success: true, message: 'Daftar satuan berhasil diambil', data }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.unitsService.findOne(id)
    return { success: true, message: 'Satuan berhasil diambil', data }
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() dto: CreateUnitDto) {
    const data = await this.unitsService.create(dto)
    return { success: true, message: 'Satuan berhasil ditambahkan', data }
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    const data = await this.unitsService.update(id, dto)
    return { success: true, message: 'Satuan berhasil diperbarui', data }
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async remove(@Param('id') id: string) {
    await this.unitsService.remove(id)
    return { success: true, message: 'Satuan berhasil dihapus' }
  }
}
